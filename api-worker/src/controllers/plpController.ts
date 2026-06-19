import { Context } from 'hono'
import { Env } from '../index'

// --- plp_meters ---
export const getPlpMeters = async (c: Context<{ Bindings: Env }>) => {
  try {
    const { results } = await c.env.DB.prepare("SELECT * FROM plp_meters ORDER BY id DESC").all()
    return c.json({ success: true, data: results })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
}

export const createPlpMeters = async (c: Context<{ Bindings: Env }>) => {
  try {
    const body = await c.req.json() as Record<string, any>;
    const keys = Object.keys(body).filter(k => k !== 'id' && k !== 'created_at');
    const placeholders = keys.map(() => '?').join(', ');
    const cols = keys.join(', ');
    const vals = keys.map(k => body[k]);
    
    await c.env.DB.prepare(`INSERT INTO plp_meters (${cols}) VALUES (${placeholders})`)
      .bind(...vals)
      .run();
      
    return c.json({ success: true, message: 'Data added successfully' })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
}

export const updatePlpMeters = async (c: Context<{ Bindings: Env }>) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json() as Record<string, any>;
    const keys = Object.keys(body).filter(k => k !== 'id' && k !== 'created_at');
    const updates = keys.map(k => `${k} = ?`).join(', ');
    const vals = keys.map(k => body[k]);
    
    await c.env.DB.prepare(`UPDATE plp_meters SET ${updates} WHERE id = ?`)
      .bind(...vals, id)
      .run();
      
    return c.json({ success: true, message: 'Data updated successfully' })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
}

export const deletePlpMeters = async (c: Context<{ Bindings: Env }>) => {
  try {
    const id = c.req.param('id');
    await c.env.DB.prepare(`DELETE FROM plp_meters WHERE id = ?`).bind(id).run();
    return c.json({ success: true, message: 'Data deleted successfully' })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
}

// --- plp_tickets ---
export const getPlpTickets = async (c: Context<{ Bindings: Env }>) => {
  try {
    const { results } = await c.env.DB.prepare("SELECT * FROM plp_tickets ORDER BY id DESC").all()
    return c.json({ success: true, data: results })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
}

export const createPlpTickets = async (c: Context<{ Bindings: Env }>) => {
  try {
    const body = await c.req.json() as Record<string, any>;
    const keys = Object.keys(body).filter(k => k !== 'id' && k !== 'created_at');
    const placeholders = keys.map(() => '?').join(', ');
    const cols = keys.join(', ');
    const vals = keys.map(k => body[k]);
    
    await c.env.DB.prepare(`INSERT INTO plp_tickets (${cols}) VALUES (${placeholders})`)
      .bind(...vals)
      .run();
      
    return c.json({ success: true, message: 'Data added successfully' })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
}

export const updatePlpTickets = async (c: Context<{ Bindings: Env }>) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json() as Record<string, any>;
    const keys = Object.keys(body).filter(k => k !== 'id' && k !== 'created_at');
    const updates = keys.map(k => `${k} = ?`).join(', ');
    const vals = keys.map(k => body[k]);
    
    await c.env.DB.prepare(`UPDATE plp_tickets SET ${updates} WHERE id = ?`)
      .bind(...vals, id)
      .run();
      
    return c.json({ success: true, message: 'Data updated successfully' })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
}

export const deletePlpTickets = async (c: Context<{ Bindings: Env }>) => {
  try {
    const id = c.req.param('id');
    await c.env.DB.prepare(`DELETE FROM plp_tickets WHERE id = ?`).bind(id).run();
    return c.json({ success: true, message: 'Data deleted successfully' })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
}

