import { Context } from 'hono'
import { Env } from '../index'

export const getDeveloperReports = async (c: Context<{ Bindings: Env }>) => {
  try {
    await c.env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS developer_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reporter_name TEXT NOT NULL,
        reporter_role TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        screenshot_url TEXT,
        status TEXT DEFAULT 'Pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    const { results } = await c.env.DB.prepare(
      "SELECT * FROM developer_reports ORDER BY created_at DESC"
    ).all();
    return c.json({ success: true, data: results });
  } catch (error: any) {
    console.error("Error getDeveloperReports:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
}

export const createDeveloperReport = async (c: Context<{ Bindings: Env }>) => {
  try {
    const body = await c.req.json() as any;
    const { reporter_name, reporter_role, title, description, screenshot_url = null } = body;

    if (!reporter_name || !reporter_role || !title || !description) {
      return c.json({ success: false, error: "Semua kolom wajib diisi" }, 400);
    }

    await c.env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS developer_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reporter_name TEXT NOT NULL,
        reporter_role TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        screenshot_url TEXT,
        status TEXT DEFAULT 'Pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    await c.env.DB.prepare(
      "INSERT INTO developer_reports (reporter_name, reporter_role, title, description, screenshot_url) VALUES (?, ?, ?, ?, ?)"
    ).bind(reporter_name, reporter_role, title, description, screenshot_url).run();

    return c.json({ success: true, message: "Laporan berhasil dikirim ke developer" });
  } catch (error: any) {
    console.error("Error createDeveloperReport:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
}

export const updateDeveloperReportStatus = async (c: Context<{ Bindings: Env }>) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json() as any;
    const { status } = body;

    if (!id || !status) {
      return c.json({ success: false, error: "ID dan status wajib diisi" }, 400);
    }

    await c.env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS developer_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reporter_name TEXT NOT NULL,
        reporter_role TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        screenshot_url TEXT,
        status TEXT DEFAULT 'Pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    await c.env.DB.prepare(
      "UPDATE developer_reports SET status = ? WHERE id = ?"
    ).bind(status, id).run();

    return c.json({ success: true, message: "Status laporan berhasil diperbarui" });
  } catch (error: any) {
    console.error("Error updateDeveloperReportStatus:", error);
    return c.json({ success: false, error: error.message }, 500);
  }
}
