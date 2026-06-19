import { Context } from 'hono'
import { Env } from '../index'

// --- pembangunan_renovasi ---
export const getPembangunanRenovasi = async (c: Context<{ Bindings: Env }>) => {
  try {
    const { results } = await c.env.DB.prepare("SELECT * FROM pembangunan_renovasi ORDER BY id DESC").all()
    return c.json({ success: true, data: results })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
}

export const createPembangunanRenovasi = async (c: Context<{ Bindings: Env }>) => {
  try {
    const body = await c.req.json() as Record<string, any>;
    const keys = Object.keys(body).filter(k => k !== 'id' && k !== 'created_at');
    const placeholders = keys.map(() => '?').join(', ');
    const cols = keys.join(', ');
    const vals = keys.map(k => body[k]);
    
    await c.env.DB.prepare(`INSERT INTO pembangunan_renovasi (${cols}) VALUES (${placeholders})`)
      .bind(...vals)
      .run();
      
    return c.json({ success: true, message: 'Data added successfully' })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
}

export const updatePembangunanRenovasi = async (c: Context<{ Bindings: Env }>) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json() as Record<string, any>;
    const keys = Object.keys(body).filter(k => k !== 'id' && k !== 'created_at');
    const updates = keys.map(k => `${k} = ?`).join(', ');
    const vals = keys.map(k => body[k]);
    
    await c.env.DB.prepare(`UPDATE pembangunan_renovasi SET ${updates} WHERE id = ?`)
      .bind(...vals, id)
      .run();
      
    return c.json({ success: true, message: 'Data updated successfully' })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
}

export const deletePembangunanRenovasi = async (c: Context<{ Bindings: Env }>) => {
  try {
    const id = c.req.param('id');
    await c.env.DB.prepare(`DELETE FROM pembangunan_renovasi WHERE id = ?`).bind(id).run();
    return c.json({ success: true, message: 'Data deleted successfully' })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
}

