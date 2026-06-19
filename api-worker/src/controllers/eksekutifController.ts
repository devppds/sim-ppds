import { Context } from 'hono'
import { Env } from '../index'

// --- 1. E-Approvals ---

export const getApprovals = async (c: Context<{ Bindings: Env }>) => {
  try {
    const status = c.req.query('status')
    const approver = c.req.query('approver')

    let query = "SELECT * FROM executive_approvals WHERE 1=1"
    const params: (string | number | null)[] = []

    if (status) {
      query += " AND status = ?"
      params.push(status)
    }
    if (approver) {
      query += " AND approver = ?"
      params.push(approver)
    }

    query += " ORDER BY id DESC"

    const { results } = await c.env.DB.prepare(query).bind(...params).all()
    return c.json({ success: true, data: results })
  } catch (error) {
    console.error("Error getApprovals:", error)
    return c.json({ success: false, error: "Gagal mengambil data approvals" }, 500)
  }
}

export const createApproval = async (c: Context<{ Bindings: Env }>) => {
  try {
    interface CreateApprovalBody {
      requester?: string;
      title?: string;
      description?: string;
      amount?: number;
      approver?: string;
    }
    const body = await c.req.json<CreateApprovalBody>()
    const { requester, title, description, amount, approver } = body

    if (!requester || !title || !approver) {
      return c.json({ success: false, error: "Data pengajuan tidak lengkap" }, 400)
    }

    await c.env.DB.prepare(
      "INSERT INTO executive_approvals (requester, title, description, amount, status, approver) VALUES (?, ?, ?, ?, 'Pending', ?)"
    ).bind(requester, title, description || '', amount || null, approver).run()

    return c.json({ success: true, message: "Pengajuan persetujuan berhasil dibuat" })
  } catch (error) {
    console.error("Error createApproval:", error)
    return c.json({ success: false, error: "Gagal membuat pengajuan persetujuan" }, 500)
  }
}

export const updateApprovalStatus = async (c: Context<{ Bindings: Env }>) => {
  try {
    const id = c.req.param('id')
    interface UpdateApprovalBody {
      status?: string;
      catatan?: string;
    }
    const body = await c.req.json<UpdateApprovalBody>()
    const { status, catatan } = body

    if (!id || !status) {
      return c.json({ success: false, error: "ID dan status wajib diisi" }, 400)
    }

    interface ApprovalRow {
      id: number;
      requester: string;
      title: string;
      description: string;
      amount: number | null;
      status: string;
      approver: string;
      catatan: string | null;
    }
    // 1. Fetch current approval details
    const approval = await c.env.DB.prepare("SELECT * FROM executive_approvals WHERE id = ?").bind(id).first<ApprovalRow>()
    if (!approval) {
      return c.json({ success: false, error: "Pengajuan tidak ditemukan" }, 404)
    }

    // 2. Update approval status
    await c.env.DB.prepare(
      "UPDATE executive_approvals SET status = ?, catatan = ?, approved_at = datetime('now') WHERE id = ?"
    ).bind(status, catatan || '', id).run()

    // 3. Automation: If approved and has amount, record to transactions as Pengeluaran
    if (status === 'Disetujui' && approval.amount && approval.amount > 0) {
      const desc = `[Disetujui: ${approval.approver}] ${approval.title} - ${approval.description || ''}`
      const category = 'Operasional'
      const dateStr = new Date().toISOString().split('T')[0]
      
      await c.env.DB.prepare(
        "INSERT INTO transactions (type, category, amount, description, date) VALUES ('Pengeluaran', ?, ?, ?, ?)"
      ).bind(category, approval.amount, desc, dateStr).run()
    }

    return c.json({ success: true, message: `Pengajuan disetujui/ditolak dengan status: ${status}` })
  } catch (error) {
    console.error("Error updateApprovalStatus:", error)
    return c.json({ success: false, error: "Gagal memproses approval" }, 500)
  }
}

// --- 2. Financial Summary for Executive ---

export const getFinancialSummary = async (c: Context<{ Bindings: Env }>) => {
  try {
    interface FinanceSummaryResult {
      total_income: number | null;
      total_expense: number | null;
    }
    const summary = await c.env.DB.prepare(`
      SELECT 
        SUM(CASE WHEN type = 'Pemasukan' THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN type = 'Pengeluaran' THEN amount ELSE 0 END) as total_expense
      FROM transactions
      WHERE deleted_at IS NULL
    `).first<FinanceSummaryResult>()

    const totalIncome = summary?.total_income || 0
    const totalExpense = summary?.total_expense || 0
    const balance = totalIncome - totalExpense

    // Fetch monthly trends for the chart
    interface TrendResult {
      label: string;
      income: number;
      expense: number;
    }
    const trends = await c.env.DB.prepare(`
      SELECT 
        strftime('%Y-%m', date) as label,
        SUM(CASE WHEN type = 'Pemasukan' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'Pengeluaran' THEN amount ELSE 0 END) as expense
      FROM transactions
      WHERE deleted_at IS NULL AND date IS NOT NULL
      GROUP BY label
      ORDER BY label ASC
      LIMIT 6
    `).all<TrendResult>()

    return c.json({
      success: true,
      data: {
        total_income: totalIncome,
        total_expense: totalExpense,
        balance,
        chart_data: trends.results
      }
    })
  } catch (error) {
    console.error("Error getFinancialSummary:", error)
    return c.json({ success: false, error: "Gagal mengambil ringkasan keuangan" }, 500)
  }
}

// --- 3. Agenda Kerja (Master Calendar) ---

export const getAgenda = async (c: Context<{ Bindings: Env }>) => {
  try {
    const { results } = await c.env.DB.prepare("SELECT * FROM agenda_kerja ORDER BY date ASC, time_start ASC").all()
    return c.json({ success: true, data: results })
  } catch (error) {
    console.error("Error getAgenda:", error)
    return c.json({ success: false, error: "Gagal mengambil agenda" }, 500)
  }
}

export const createAgenda = async (c: Context<{ Bindings: Env }>) => {
  try {
    interface AgendaBody {
      title?: string;
      description?: string;
      date?: string;
      time_start?: string;
      time_end?: string;
      location?: string;
    }
    const body = await c.req.json<AgendaBody>()
    const { title, description, date, time_start, time_end, location } = body

    if (!title || !date) {
      return c.json({ success: false, error: "Judul dan tanggal wajib diisi" }, 400)
    }

    await c.env.DB.prepare(`
      INSERT INTO agenda_kerja (title, description, date, time_start, time_end, location)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(title, description || '', date, time_start || null, time_end || null, location || '').run()

    return c.json({ success: true, message: "Agenda baru berhasil ditambahkan" })
  } catch (error) {
    console.error("Error createAgenda:", error)
    return c.json({ success: false, error: "Gagal menambahkan agenda" }, 500)
  }
}

export const updateAgenda = async (c: Context<{ Bindings: Env }>) => {
  try {
    const id = c.req.param('id')
    interface AgendaBody {
      title?: string;
      description?: string;
      date?: string;
      time_start?: string;
      time_end?: string;
      location?: string;
    }
    const body = await c.req.json<AgendaBody>()
    const { title, description, date, time_start, time_end, location } = body

    if (!id || !title || !date) {
      return c.json({ success: false, error: "ID, judul, dan tanggal wajib diisi" }, 400)
    }

    await c.env.DB.prepare(`
      UPDATE agenda_kerja
      SET title = ?, description = ?, date = ?, time_start = ?, time_end = ?, location = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(title, description || '', date, time_start || null, time_end || null, location || '', id).run()

    return c.json({ success: true, message: "Agenda berhasil diperbarui" })
  } catch (error) {
    console.error("Error updateAgenda:", error)
    return c.json({ success: false, error: "Gagal memperbarui agenda" }, 500)
  }
}

export const deleteAgenda = async (c: Context<{ Bindings: Env }>) => {
  try {
    const id = c.req.param('id')
    if (!id) return c.json({ success: false, error: "ID wajib ada" }, 400)

    await c.env.DB.prepare("DELETE FROM agenda_kerja WHERE id = ?").bind(id).run()
    return c.json({ success: true, message: "Agenda berhasil dihapus" })
  } catch (error) {
    console.error("Error deleteAgenda:", error)
    return c.json({ success: false, error: "Gagal menghapus agenda" }, 500)
  }
}
