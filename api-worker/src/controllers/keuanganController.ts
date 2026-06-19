import { Context } from 'hono'
import { Env } from '../index'

export const getTransactions = async (c: Context<{ Bindings: Env }>) => {
  try {
    const showTrashed = c.req.query("trashed") === "true";
    const whereClause = showTrashed ? "WHERE deleted_at IS NOT NULL" : "WHERE deleted_at IS NULL";
    
    const { results } = await c.env.DB.prepare(
      `SELECT * FROM transactions ${whereClause} ORDER BY date DESC, id DESC LIMIT 100`
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
      proof_url = null 
    } = body;

    if (!type || !category || !amount) {
      return c.json({ success: false, error: "Tipe, kategori, dan jumlah harus diisi" }, 400);
    }

    await c.env.DB.prepare(
      "INSERT INTO transactions (type, category, amount, description, date, proof_url) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(type, category, amount, description, date, proof_url).run();

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
    const { type, category, amount, description, date, proof_url } = body;

    if (!id) return c.json({ success: false, error: "ID wajib ada" }, 400);

    await c.env.DB.prepare(`
      UPDATE transactions 
      SET type = ?, category = ?, amount = ?, description = ?, date = ?, proof_url = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(type, category, amount, description, date, proof_url, id).run();

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

    if (permanent) {
      await c.env.DB.prepare("DELETE FROM transactions WHERE id = ?").bind(id).run();
      return c.json({ success: true, message: "Transaksi dihapus permanen" });
    } else {
      await c.env.DB.prepare("UPDATE transactions SET deleted_at = datetime('now') WHERE id = ?").bind(id).run();
      return c.json({ success: true, message: "Transaksi dipindah ke Recycle Bin" });
    }
  } catch (error) {
    console.error("Finance DELETE Error:", error);
    return c.json({ success: false, error: "Internal Server Error" }, 500);
  }
}
