import { Context } from 'hono'
import { Env } from '../index'
import { triggerCloudinaryDelete } from '../utils/cloudinary'

export const getTransactions = async (c: Context<{ Bindings: Env }>) => {
  try {
    const showTrashed = c.req.query("trashed") === "true";
    const whereClause = showTrashed ? "WHERE t.deleted_at IS NOT NULL" : "WHERE t.deleted_at IS NULL";
    
    const { results } = await c.env.DB.prepare(
      `SELECT t.*, s.name as santri_name, s.nisn as santri_nisn 
       FROM transactions t 
       LEFT JOIN santri s ON t.santri_id = s.id 
       ${whereClause} 
       ORDER BY t.date DESC, t.id DESC LIMIT 100`
    ).all();

    const summary = await c.env.DB.prepare(`
      SELECT 
        SUM(CASE WHEN type = 'Pemasukan' THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN type = 'Pengeluaran' THEN amount ELSE 0 END) as total_expense
      FROM transactions
      WHERE deleted_at IS NULL
    `).first() as any;

    c.header('Cache-Control', 'public, max-age=5, s-maxage=5');
    return c.json({ 
      success: true, 
      data: results,
      summary: summary || { total_income: 0, total_expense: 0 }
    });
  } catch (error) {
    console.error("Finance API Error:", error);
    return c.json({ success: false, error: "Internal Server Error" }, 500);
  }
}

export const createTransaction = async (c: Context<{ Bindings: Env }>) => {
  try {
    const body = await c.req.json() as any;
    const { 
      type, 
      category, 
      amount, 
      description = "", 
      date = new Date().toISOString().split('T')[0],
      proof_url = null,
      santri_id = null
    } = body;

    if (!type || !category || !amount) {
      return c.json({ success: false, error: "Tipe, kategori, dan jumlah harus diisi" }, 400);
    }

    await c.env.DB.prepare(
      "INSERT INTO transactions (type, category, amount, description, date, proof_url, santri_id) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).bind(type, category, amount, description, date, proof_url, santri_id ? parseInt(String(santri_id)) : null).run();

    return c.json({ success: true, message: "Transaksi berhasil dicatat" });
  } catch (error) {
    console.error("Finance POST Error:", error);
    return c.json({ success: false, error: "Internal Server Error" }, 500);
  }
}

export const updateTransaction = async (c: Context<{ Bindings: Env }>) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json() as any;
    const { type, category, amount, description, date, proof_url, santri_id = null } = body;

    if (!id) return c.json({ success: false, error: "ID wajib ada" }, 400);

    await c.env.DB.prepare(`
      UPDATE transactions 
      SET type = ?, category = ?, amount = ?, description = ?, date = ?, proof_url = ?, santri_id = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(type, category, amount, description, date, proof_url, santri_id ? parseInt(String(santri_id)) : null, id).run();

    return c.json({ success: true, message: "Transaksi diperbarui" });
  } catch (error) {
    console.error("Finance PUT Error:", error);
    return c.json({ success: false, error: "Internal Server Error" }, 500);
  }
}

export const deleteTransaction = async (c: Context<{ Bindings: Env }>) => {
  try {
    const id = c.req.param('id');
    const permanent = c.req.query("permanent") === "true";

    if (!id) return c.json({ success: false, error: "ID wajib ada" }, 400);

    const tx = await c.env.DB.prepare("SELECT * FROM transactions WHERE id = ?").bind(id).first() as any;
    if (!tx) return c.json({ success: false, error: "Transaksi tidak ditemukan" }, 404);

    if (permanent) {
      if (tx.proof_url) {
        await triggerCloudinaryDelete(c, tx.proof_url);
      }
      await c.env.DB.prepare("DELETE FROM transactions WHERE id = ?").bind(id).run();
    } else {
      await c.env.DB.prepare("UPDATE transactions SET deleted_at = datetime('now') WHERE id = ?").bind(id).run();
    }

    // Auto Cancel SPP if this transaction is an SPP payment
    if (tx.category === 'SPP') {
      const santriId = tx.santri_id;
      let period = null;
      let academicYear = null;
      
      // Try to parse period and academic year from description
      // Format: Syahriah {period} {academic_year} - {santriName}
      const match = tx.description?.match(/Syahriah (.+?) (\d{4}\/\d{4}) -/);
      if (match) {
        period = match[1];
        academicYear = match[2];
      }

      if (santriId && period && academicYear) {
        if (permanent) {
          await c.env.DB.prepare("DELETE FROM spp_payments WHERE santri_id = ? AND period = ? AND academic_year = ?").bind(santriId, period, academicYear).run();
        } else {
           await c.env.DB.prepare("UPDATE spp_payments SET status = 'Tunggakan' WHERE santri_id = ? AND period = ? AND academic_year = ?").bind(santriId, period, academicYear).run();
        }
      }
    }

    return c.json({ success: true, message: permanent ? "Transaksi dihapus permanen" : "Transaksi dipindah ke Recycle Bin" });
  } catch (error) {
    console.error("Finance DELETE Error:", error);
    return c.json({ success: false, error: "Internal Server Error" }, 500);
  }
}
