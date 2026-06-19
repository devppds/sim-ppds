import { Context } from 'hono'
import { Env } from '../index'

export const getClearanceList = async (c: Context<{ Bindings: Env }>) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT cb.*, s.name as santri_name, s.nisn as santri_nisn, s.kelas as santri_kelas, s.asrama as santri_asrama, s.status as santri_status
      FROM clearance_boyong cb
      JOIN santri s ON cb.santri_id = s.id
      ORDER BY cb.created_at DESC
    `).all()
    return c.json({ success: true, data: results })
  } catch (error) {
    console.error("Error getClearanceList:", error)
    return c.json({ success: false, error: "Gagal mengambil antrean clearance" }, 500)
  }
}

export const applyClearance = async (c: Context<{ Bindings: Env }>) => {
  try {
    const body = await c.req.json<{ santri_id?: number }>()
    const { santri_id } = body

    if (!santri_id) {
      return c.json({ success: false, error: "Santri wajib dipilih" }, 400)
    }

    // Check if request already exists
    const existing = await c.env.DB.prepare(
      "SELECT id FROM clearance_boyong WHERE santri_id = ?"
    ).bind(santri_id).first()

    if (existing) {
      return c.json({ success: false, error: "Clearance untuk santri ini sudah diajukan" }, 400)
    }

    await c.env.DB.prepare(
      "INSERT INTO clearance_boyong (santri_id, status_keuangan, status_keamanan, acc_mustahiq, status_akhir) VALUES (?, 'Clean', 'Clean', 'Pending', 'Diajukan')"
    ).bind(santri_id).run()

    return c.json({ success: true, message: "Pengajuan boyong berhasil didaftarkan" })
  } catch (error) {
    console.error("Error applyClearance:", error)
    return c.json({ success: false, error: "Gagal mendaftarkan pengajuan boyong" }, 500)
  }
}

export const checkClearanceStatus = async (c: Context<{ Bindings: Env }>) => {
  try {
    const santriId = c.req.query('santri_id')
    if (!santriId) {
      return c.json({ success: false, error: "Santri ID wajib disertakan" }, 400)
    }

    interface SppArrearsResult { count?: number; total_amount?: number; }
    // 1. Check financial arrears (Tunggakan SPP)
    const sppArrears = await c.env.DB.prepare(
      "SELECT COUNT(*) as count, SUM(amount) as total_amount FROM spp_payments WHERE santri_id = ? AND status = 'Tunggakan'"
    ).bind(santriId).first<SppArrearsResult>()

    const arrearsCount = sppArrears?.count || 0
    const arrearsAmount = sppArrears?.total_amount || 0
    const statusKeuangan = arrearsCount > 0 ? 'Blocked' : 'Clean'
    const catatanKeuangan = arrearsCount > 0 
      ? `Terdeteksi ${arrearsCount} tunggakan SPP sebesar Rp ${arrearsAmount.toLocaleString()}` 
      : 'Bebas tunggakan SPP'

    // 2. Check security violations (Pelanggaran active)
    interface ViolationsResult { count?: number; total_point?: number; }
    const violations = await c.env.DB.prepare(
      "SELECT COUNT(*) as count, SUM(point) as total_point FROM pelanggaran WHERE santri_id = ? AND status != 'Selesai'"
    ).bind(santriId).first<ViolationsResult>()

    const violationsCount = violations?.count || 0
    const violationsPoints = violations?.total_point || 0
    const statusKeamanan = violationsCount > 0 ? 'Blocked' : 'Clean'
    const catatanKeamanan = violationsCount > 0
      ? `Memiliki ${violationsCount} pelanggaran aktif (${violationsPoints} poin) belum selesai`
      : 'Catatan pelanggaran bersih'

    // 3. Update the clearance record in the DB automatically to match verified status
    await c.env.DB.prepare(`
      UPDATE clearance_boyong
      SET status_keuangan = ?, status_keamanan = ?, catatan_keuangan = ?, catatan_keamanan = ?
      WHERE santri_id = ?
    `).bind(statusKeuangan, statusKeamanan, catatanKeuangan, catatanKeamanan, santriId).run()

    return c.json({
      success: true,
      data: {
        santri_id: parseInt(santriId),
        status_keuangan: statusKeuangan,
        status_keamanan: statusKeamanan,
        catatan_keuangan: catatanKeuangan,
        catatan_keamanan: catatanKeamanan
      }
    })
  } catch (error) {
    console.error("Error checkClearanceStatus:", error)
    return c.json({ success: false, error: "Gagal memverifikasi status clearance" }, 500)
  }
}

export const updateClearanceCheckpoint = async (c: Context<{ Bindings: Env }>) => {
  try {
    const id = c.req.param('id')
    interface UpdateClearanceBody {
      status_keuangan?: string;
      status_keamanan?: string;
      acc_mustahiq?: string;
      status_akhir?: string;
      catatan_keuangan?: string;
      catatan_keamanan?: string;
      catatan_akhir?: string;
    }
    const body = await c.req.json<UpdateClearanceBody>()
    const { 
      status_keuangan, 
      status_keamanan, 
      acc_mustahiq, 
      status_akhir, 
      catatan_keuangan, 
      catatan_keamanan, 
      catatan_akhir 
    } = body

    if (!id) return c.json({ success: false, error: "ID wajib disertakan" }, 400)

    interface ClearanceRow {
      id: number;
      santri_id: number;
      status_keuangan: string;
      status_keamanan: string;
      acc_mustahiq: string;
      status_akhir: string;
      approved_at: string | null;
    }
    // Fetch original request details
    const current = await c.env.DB.prepare("SELECT * FROM clearance_boyong WHERE id = ?").bind(id).first<ClearanceRow>()
    if (!current) {
      return c.json({ success: false, error: "Pengajuan clearance tidak ditemukan" }, 404)
    }

    // Build update query dynamic
    let query = "UPDATE clearance_boyong SET "
    const fields: string[] = []
    const params: (string | number | null)[] = []

    if (status_keuangan) { fields.push("status_keuangan = ?"); params.push(status_keuangan); }
    if (status_keamanan) { fields.push("status_keamanan = ?"); params.push(status_keamanan); }
    if (acc_mustahiq) { fields.push("acc_mustahiq = ?"); params.push(acc_mustahiq); }
    if (status_akhir) { fields.push("status_akhir = ?"); params.push(status_akhir); }
    if (catatan_keuangan !== undefined) { fields.push("catatan_keuangan = ?"); params.push(catatan_keuangan); }
    if (catatan_keamanan !== undefined) { fields.push("catatan_keamanan = ?"); params.push(catatan_keamanan); }
    if (catatan_akhir !== undefined) { fields.push("catatan_akhir = ?"); params.push(catatan_akhir); }

    if (status_akhir === 'Disetujui') {
      fields.push("approved_at = datetime('now')")
    }

    if (fields.length === 0) {
      return c.json({ success: false, error: "Tidak ada field untuk diperbarui" }, 400)
    }

    query += fields.join(", ") + " WHERE id = ?"
    params.push(id)

    await c.env.DB.prepare(query).bind(...params).run()

    // 4. Automation: If final status is approved, update Santri status to 'Keluar' (or boyong status)
    if (status_akhir === 'Disetujui') {
      await c.env.DB.prepare("UPDATE santri SET status = 'Keluar', updated_at = datetime('now') WHERE id = ?")
        .bind(current.santri_id)
        .run()
    }

    return c.json({ success: true, message: "Checkpoint clearance berhasil diperbarui" })
  } catch (error) {
    console.error("Error updateClearanceCheckpoint:", error)
    return c.json({ success: false, error: "Gagal memperbarui checkpoint" }, 500)
  }
}

export const deleteClearance = async (c: Context<{ Bindings: Env }>) => {
  try {
    const id = c.req.param('id')
    if (!id) return c.json({ success: false, error: "ID wajib disertakan" }, 400)

    await c.env.DB.prepare("DELETE FROM clearance_boyong WHERE id = ?").bind(id).run()
    return c.json({ success: true, message: "Pengajuan boyong dibatalkan" })
  } catch (error) {
    console.error("Error deleteClearance:", error)
    return c.json({ success: false, error: "Gagal membatalkan pengajuan boyong" }, 500)
  }
}
