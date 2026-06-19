import { Context } from 'hono'
import { Env } from '../index'

export const getNotifications = async (c: Context<{ Bindings: Env }>) => {
  try {
    const { results } = await c.env.DB.prepare(
      "SELECT * FROM notifications ORDER BY created_at DESC LIMIT 10"
    ).all();

    const unreadCount = await c.env.DB.prepare(
      "SELECT COUNT(*) as count FROM notifications WHERE is_read = 0"
    ).first() as any;

    c.header('Cache-Control', 'public, max-age=3, s-maxage=3');
    return c.json({ 
      success: true, 
      data: results, 
      unreadCount: unreadCount?.count || 0 
    });
  } catch (error) {
    console.error("Notifications GET Error:", error);
    return c.json({ success: false, error: "Internal Server Error" }, 500);
  }
}

export const markNotificationsRead = async (c: Context<{ Bindings: Env }>) => {
  try {
    const id = c.req.query("id");

    if (id === "all") {
      await c.env.DB.prepare("UPDATE notifications SET is_read = 1").run();
    } else {
      await c.env.DB.prepare("UPDATE notifications SET is_read = 1 WHERE id = ?").bind(id).run();
    }

    return c.json({ success: true, message: "Notifikasi diperbarui" });
  } catch (error) {
    console.error("Notifications PUT Error:", error);
    return c.json({ success: false, error: "Internal Server Error" }, 500);
  }
}

export const createNotification = async (c: Context<{ Bindings: Env }>) => {
  try {
    const { title, message, type } = await c.req.json() as { title: string; message: string; type: string };
    if (!title || !message) {
      return c.json({ success: false, error: "Judul dan pesan wajib diisi" }, 400);
    }
    await c.env.DB.prepare(
      "INSERT INTO notifications (title, message, type, is_read, created_at) VALUES (?, ?, ?, 0, datetime('now'))"
    ).bind(title, message, type || 'info').run();
    return c.json({ success: true, message: "Notifikasi berhasil dibuat" });
  } catch (error: any) {
    console.error("Notifications POST Error:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
}
