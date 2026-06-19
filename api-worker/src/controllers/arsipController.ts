import { Context } from 'hono'
import { Env } from '../index'
import { triggerCloudinaryDelete } from '../utils/cloudinary'

export const getArsipList = async (c: Context<{ Bindings: Env }>) => {
  try {
    const { results } = await c.env.DB.prepare(
      "SELECT * FROM arsip ORDER BY created_at DESC"
    ).all();

    c.header('Cache-Control', 'public, max-age=5, s-maxage=5');
    return c.json({ success: true, data: results });
  } catch (error) {
    console.error("Error fetching arsip:", error);
    return c.json({ success: false, error: "Gagal mengambil data arsip" }, 500);
  }
}

export const createArsip = async (c: Context<{ Bindings: Env }>) => {
  try {
    const body = await c.req.json() as any;
    const { name, url, type, size, category, doc_date, doc_number, flow_type, sender_receiver } = body;

    if (!name || !url) {
      return c.json({ success: false, error: "Nama dan URL wajib diisi" }, 400);
    }

    await c.env.DB.prepare(
      "INSERT INTO arsip (name, url, type, size, category, doc_date, doc_number, flow_type, sender_receiver) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(name, url, type, size, category, doc_date, doc_number, flow_type, sender_receiver).run();

    return c.json({ success: true });
  } catch (error: any) {
    console.error("Error saving arsip:", error);
    return c.json({ 
      success: false, 
      error: "Gagal menyimpan ke database: " + (error.message || "Unknown error") 
    }, 500);
  }
}

export const deleteArsip = async (c: Context<{ Bindings: Env }>) => {
  try {
    const id = c.req.param('id');
    if (!id) {
      return c.json({ success: false, error: "ID wajib ada" }, 400);
    }

    // Select old file URL to delete from Cloudinary
    const arsip = await c.env.DB.prepare("SELECT url FROM arsip WHERE id = ?").bind(id).first() as any;
    if (arsip && arsip.url) {
      await triggerCloudinaryDelete(c, arsip.url);
    }

    await c.env.DB.prepare("DELETE FROM arsip WHERE id = ?").bind(id).run();
    return c.json({ success: true, message: "Arsip berhasil dihapus" });
  } catch (error: any) {
    console.error("Error deleting arsip:", error);
    return c.json({ success: false, error: "Gagal menghapus arsip: " + (error.message || "") }, 500);
  }
}

export const updateArsip = async (c: Context<{ Bindings: Env }>) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json() as any;
    const { name, url, type, size, category, doc_date, doc_number, flow_type, sender_receiver } = body;

    if (!id) {
      return c.json({ success: false, error: "ID wajib ada" }, 400);
    }

    await c.env.DB.prepare(`
      UPDATE arsip 
      SET name = COALESCE(?, name),
          url = COALESCE(?, url),
          type = COALESCE(?, type),
          size = COALESCE(?, size),
          category = COALESCE(?, category),
          doc_date = COALESCE(?, doc_date),
          doc_number = COALESCE(?, doc_number),
          flow_type = COALESCE(?, flow_type),
          sender_receiver = COALESCE(?, sender_receiver)
      WHERE id = ?
    `).bind(name, url, type, size, category, doc_date, doc_number, flow_type, sender_receiver, id).run();

    return c.json({ success: true, message: "Arsip berhasil diperbarui" });
  } catch (error: any) {
    console.error("Error updating arsip:", error);
    return c.json({ success: false, error: "Gagal memperbarui arsip: " + (error.message || "") }, 500);
  }
}
