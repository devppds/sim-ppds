import { Hono } from 'hono'
import { cors } from 'hono/cors'
import pengurusRoutes from './routes/pengurus'

export type Env = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Env }>()

// Global CORS Middleware
app.use('*', cors({
  origin: '*', // Pada tahap produksi, ganti dengan domain Frontend Next.js Anda
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}))

// Health Check
app.get('/', (c) => {
  return c.json({ message: 'SIM-PPDS API Worker Running!', status: 'active' })
})

import santriRoutes from './routes/santri'
import sppRoutes from './routes/spp'

// Register Routes
app.route('/api/pengurus', pengurusRoutes)
app.route('/api/santri', santriRoutes)
app.route('/api/spp', sppRoutes)

// Settings Endpoints (D1 Backed, 100% Real-time)
app.get('/api/settings', async (c) => {
  try {
    const { results } = await c.env.DB.prepare("SELECT key, value FROM settings").all();
    const configObj = results.reduce((acc: any, row: any) => {
      acc[row.key] = row.value;
      return acc;
    }, {});
    c.header('Cache-Control', 'public, max-age=5, s-maxage=5');
    return c.json({ success: true, data: configObj });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return c.json({ success: false, error: "Gagal mengambil pengaturan" }, 500);
  }
});

app.post('/api/settings', async (c) => {
  try {
    const body = await c.req.json() as Record<string, any>;
    if (!body || Object.keys(body).length === 0) {
      return c.json({ success: false, error: "Data kosong" }, 400);
    }

    const statements = Object.entries(body).map(([key, val]) => {
      return c.env.DB.prepare(
        "INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now'))"
      ).bind(key, String(val));
    });

    await c.env.DB.batch(statements);
    return c.json({ success: true, message: "Pengaturan berhasil diperbarui" });
  } catch (error) {
    console.error("Error updating settings:", error);
    return c.json({ success: false, error: "Gagal menyimpan pengaturan" }, 500);
  }
});

export default app
