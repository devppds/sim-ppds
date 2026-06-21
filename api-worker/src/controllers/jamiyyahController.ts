import { Context } from 'hono'
import { Env } from '../index'

// --- jamiyyah_events ---
export const getJamiyyahEvents = async (c: Context<{ Bindings: Env }>) => {
  try {
    const { results } = await c.env.DB.prepare("SELECT * FROM jamiyyah_events ORDER BY id DESC").all()
    return c.json({ success: true, data: results })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
}

export const createJamiyyahEvents = async (c: Context<{ Bindings: Env }>) => {
  try {
    const body = await c.req.json() as Record<string, any>;
    const keys = Object.keys(body).filter(k => k !== 'id' && k !== 'created_at');
    const placeholders = keys.map(() => '?').join(', ');
    const cols = keys.join(', ');
    const vals = keys.map(k => body[k]);
    
    await c.env.DB.prepare(`INSERT INTO jamiyyah_events (${cols}) VALUES (${placeholders})`)
      .bind(...vals)
      .run();
      
    return c.json({ success: true, message: 'Data added successfully' })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
}

export const updateJamiyyahEvents = async (c: Context<{ Bindings: Env }>) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json() as Record<string, any>;
    const keys = Object.keys(body).filter(k => k !== 'id' && k !== 'created_at');
    const updates = keys.map(k => `${k} = ?`).join(', ');
    const vals = keys.map(k => body[k]);
    
    await c.env.DB.prepare(`UPDATE jamiyyah_events SET ${updates} WHERE id = ?`)
      .bind(...vals, id)
      .run();
      
    return c.json({ success: true, message: 'Data updated successfully' })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
}

export const deleteJamiyyahEvents = async (c: Context<{ Bindings: Env }>) => {
  try {
    const id = c.req.param('id');
    await c.env.DB.prepare(`DELETE FROM jamiyyah_events WHERE id = ?`).bind(id).run();
    return c.json({ success: true, message: 'Data deleted successfully' })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
}

// --- jamiyyah_assets ---
export const getJamiyyahAssets = async (c: Context<{ Bindings: Env }>) => {
  try {
    const { results } = await c.env.DB.prepare("SELECT * FROM jamiyyah_assets ORDER BY id DESC").all()
    return c.json({ success: true, data: results })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
}

export const createJamiyyahAssets = async (c: Context<{ Bindings: Env }>) => {
  try {
    const body = await c.req.json() as Record<string, any>;
    const keys = Object.keys(body).filter(k => k !== 'id' && k !== 'created_at');
    const placeholders = keys.map(() => '?').join(', ');
    const cols = keys.join(', ');
    const vals = keys.map(k => body[k]);
    
    await c.env.DB.prepare(`INSERT INTO jamiyyah_assets (${cols}) VALUES (${placeholders})`)
      .bind(...vals)
      .run();
      
    return c.json({ success: true, message: 'Data added successfully' })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
}

export const updateJamiyyahAssets = async (c: Context<{ Bindings: Env }>) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json() as Record<string, any>;
    const keys = Object.keys(body).filter(k => k !== 'id' && k !== 'created_at');
    const updates = keys.map(k => `${k} = ?`).join(', ');
    const vals = keys.map(k => body[k]);
    
    await c.env.DB.prepare(`UPDATE jamiyyah_assets SET ${updates} WHERE id = ?`)
      .bind(...vals, id)
      .run();
      
    return c.json({ success: true, message: 'Data updated successfully' })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
}

export const deleteJamiyyahAssets = async (c: Context<{ Bindings: Env }>) => {
  try {
    const id = c.req.param('id');
    await c.env.DB.prepare(`DELETE FROM jamiyyah_assets WHERE id = ?`).bind(id).run();
    return c.json({ success: true, message: 'Data deleted successfully' })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
}

// --- jamiyyah_grup ---
export const getGrup = async (c: Context<{ Bindings: Env }>) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT * FROM jamiyyah_grup ORDER BY nama_grup ASC
    `).all()
    return c.json({ success: true, data: results })
  } catch (error: any) {
    console.error("Error getGrup:", error)
    return c.json({ success: false, error: "Failed to fetch data" }, 500)
  }
}

export const createGrup = async (c: Context<{ Bindings: Env }>) => {
  try {
    const body = await c.req.json() as any
    await c.env.DB.prepare(`
      INSERT INTO jamiyyah_grup (nama_grup, deskripsi)
      VALUES (?, ?)
    `).bind(body.nama_grup, body.deskripsi || "").run()
    
    return c.json({ success: true, message: "Grup berhasil ditambahkan" })
  } catch (error: any) {
    console.error("Error createGrup:", error)
    return c.json({ success: false, error: "Failed to save data" }, 500)
  }
}

// --- jamiyyah_alat ---
export const getAlat = async (c: Context<{ Bindings: Env }>) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT a.*, 
             CASE 
               WHEN a.jenis_kepemilikan = 'Pribadi' THEN s.name
               WHEN a.jenis_kepemilikan = 'Jam''iyyah' THEN g.nama_grup
             END as nama_pemilik
      FROM jamiyyah_alat a
      LEFT JOIN santri s ON a.jenis_kepemilikan = 'Pribadi' AND a.pemilik_id = s.id
      LEFT JOIN jamiyyah_grup g ON a.jenis_kepemilikan = 'Jam''iyyah' AND a.pemilik_id = g.id
      ORDER BY a.id DESC
    `).all()
    return c.json({ success: true, data: results })
  } catch (error: any) {
    console.error("Error getAlat:", error)
    return c.json({ success: false, error: "Failed to fetch data" }, 500)
  }
}

export const createAlat = async (c: Context<{ Bindings: Env }>) => {
  try {
    const body = await c.req.json() as any
    await c.env.DB.prepare(`
      INSERT INTO jamiyyah_alat (jenis_kepemilikan, pemilik_id, nama_alat, jumlah, tanggal_kadaluarsa)
      VALUES (?, ?, ?, ?, ?)
    `).bind(body.jenis_kepemilikan, body.pemilik_id, body.nama_alat, body.jumlah, body.tanggal_kadaluarsa).run()
    
    return c.json({ success: true, message: "Alat berhasil ditambahkan" })
  } catch (error: any) {
    console.error("Error createAlat:", error)
    return c.json({ success: false, error: "Failed to save data" }, 500)
  }
}
