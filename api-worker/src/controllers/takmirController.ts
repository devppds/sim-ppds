import { Context } from 'hono'
import { Env } from '../index'

// --- takmir_schedules ---
export const getTakmirSchedules = async (c: Context<{ Bindings: Env }>) => {
  try {
    const { results } = await c.env.DB.prepare("SELECT * FROM takmir_schedules ORDER BY id DESC").all()
    return c.json({ success: true, data: results })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
}

export const createTakmirSchedules = async (c: Context<{ Bindings: Env }>) => {
  try {
    const body = await c.req.json() as Record<string, any>;
    const keys = Object.keys(body).filter(k => k !== 'id' && k !== 'created_at');
    const placeholders = keys.map(() => '?').join(', ');
    const cols = keys.join(', ');
    const vals = keys.map(k => body[k]);
    
    await c.env.DB.prepare(`INSERT INTO takmir_schedules (${cols}) VALUES (${placeholders})`)
      .bind(...vals)
      .run();
      
    return c.json({ success: true, message: 'Data added successfully' })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
}

export const updateTakmirSchedules = async (c: Context<{ Bindings: Env }>) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json() as Record<string, any>;
    const keys = Object.keys(body).filter(k => k !== 'id' && k !== 'created_at');
    const updates = keys.map(k => `${k} = ?`).join(', ');
    const vals = keys.map(k => body[k]);
    
    await c.env.DB.prepare(`UPDATE takmir_schedules SET ${updates} WHERE id = ?`)
      .bind(...vals, id)
      .run();
      
    return c.json({ success: true, message: 'Data updated successfully' })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
}

export const deleteTakmirSchedules = async (c: Context<{ Bindings: Env }>) => {
  try {
    const id = c.req.param('id');
    await c.env.DB.prepare(`DELETE FROM takmir_schedules WHERE id = ?`).bind(id).run();
    return c.json({ success: true, message: 'Data deleted successfully' })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
}

// --- takmir_bookings ---
export const getTakmirBookings = async (c: Context<{ Bindings: Env }>) => {
  try {
    const { results } = await c.env.DB.prepare("SELECT * FROM takmir_bookings ORDER BY id DESC").all()
    return c.json({ success: true, data: results })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
}

export const createTakmirBookings = async (c: Context<{ Bindings: Env }>) => {
  try {
    const body = await c.req.json() as Record<string, any>;
    const keys = Object.keys(body).filter(k => k !== 'id' && k !== 'created_at');
    const placeholders = keys.map(() => '?').join(', ');
    const cols = keys.join(', ');
    const vals = keys.map(k => body[k]);
    
    await c.env.DB.prepare(`INSERT INTO takmir_bookings (${cols}) VALUES (${placeholders})`)
      .bind(...vals)
      .run();
      
    return c.json({ success: true, message: 'Data added successfully' })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
}

export const updateTakmirBookings = async (c: Context<{ Bindings: Env }>) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json() as Record<string, any>;
    const keys = Object.keys(body).filter(k => k !== 'id' && k !== 'created_at');
    const updates = keys.map(k => `${k} = ?`).join(', ');
    const vals = keys.map(k => body[k]);
    
    await c.env.DB.prepare(`UPDATE takmir_bookings SET ${updates} WHERE id = ?`)
      .bind(...vals, id)
      .run();
      
    return c.json({ success: true, message: 'Data updated successfully' })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
}

export const deleteTakmirBookings = async (c: Context<{ Bindings: Env }>) => {
  try {
    const id = c.req.param('id');
    await c.env.DB.prepare(`DELETE FROM takmir_bookings WHERE id = ?`).bind(id).run();
    return c.json({ success: true, message: 'Data deleted successfully' })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
}

