import { Hono } from 'hono'
import { cors } from 'hono/cors'
import pengurusRoutes from './routes/pengurus'
import santriRoutes from './routes/santri'
import sppRoutes from './routes/spp'
import keamananRoutes from './routes/keamanan'
import pendidikanRoutes from './routes/pendidikan'
import wajarRoutes from './routes/wajar'
import fasilitasRoutes from './routes/fasilitas'
import logistikRoutes from './routes/logistik'
import klinikRoutes from './routes/klinik'
import bumpRoutes from './routes/bump'
import eksekutifRoutes from './routes/eksekutif'
import clearanceRoutes from './routes/clearance'
import takmirRoutes from './routes/takmir'

import mediaRoutes from './routes/media'

import pembangunanRoutes from './routes/pembangunan'

import kbrRoutes from './routes/kbr'

import plpRoutes from './routes/plp'

import jamiyyahRoutes from './routes/jamiyyah'


import { getDashboardStats, getMenuStats, getDevStats } from './controllers/statsController'
import { getAsramaData } from './controllers/asramaController'
import { getArsipList, createArsip, deleteArsip, updateArsip } from './controllers/arsipController'
import { getTransactions, createTransaction, updateTransaction, deleteTransaction } from './controllers/keuanganController'
import { getNotifications, markNotificationsRead, createNotification } from './controllers/notificationsController'
import { getSearchResults } from './controllers/searchController'
import { getAlumniList, createAlumni } from './controllers/alumniController'

export type Env = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Env }>()

// Global CORS Middleware
app.use('*', cors({
  origin: '*', 
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}))

// Health Check
app.get('/', (c) => {
  return c.json({ message: 'SIM-PPDS API Worker Running!', status: 'active' })
})

// Register Routed Routers
app.route('/api/pengurus', pengurusRoutes)
app.route('/api/santri', santriRoutes)
app.route('/api/spp', sppRoutes)
app.route('/api/keamanan', keamananRoutes)
app.route('/api/pendidikan', pendidikanRoutes)
app.route('/api/wajar', wajarRoutes)
app.route('/api/fasilitas', fasilitasRoutes)
app.route('/api/logistik', logistikRoutes)
app.route('/api/klinik', klinikRoutes)
app.route('/api/bump', bumpRoutes)
app.route('/api/eksekutif', eksekutifRoutes)
app.route('/api/clearance', clearanceRoutes)
app.route('/api/takmir', takmirRoutes)

app.route('/api/media', mediaRoutes)

app.route('/api/pembangunan', pembangunanRoutes)

app.route('/api/kbr', kbrRoutes)

app.route('/api/plp', plpRoutes)

app.route('/api/jamiyyah', jamiyyahRoutes)


// Settings Endpoints (D1 Backed, 100% Real-time)
app.get('/api/settings', async (c) => {
  try {
    const { results } = await c.env.DB.prepare("SELECT key, value FROM settings").all();
    const configObj = results.reduce<Record<string, unknown>>((acc, row) => {
      acc[String(row.key)] = row.value;
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
    const body = await c.req.json() as Record<string, unknown>;
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

// Stats Endpoints
app.get('/api/stats', getDashboardStats)
app.get('/api/stats/menu', getMenuStats)
app.get('/api/dev/stats', getDevStats)

// Asrama Endpoints
app.get('/api/asrama', getAsramaData)

// Arsip Endpoints
app.get('/api/arsip', getArsipList)
app.post('/api/arsip', createArsip)
app.put('/api/arsip/:id', updateArsip)
app.delete('/api/arsip/:id', deleteArsip)

// Keuangan Endpoints
app.get('/api/keuangan', getTransactions)
app.post('/api/keuangan', createTransaction)
app.put('/api/keuangan/:id', updateTransaction)
app.delete('/api/keuangan/:id', deleteTransaction)
app.post('/api/keuangan/restore', async (c) => {
  try {
    const id = c.req.query("id");
    if (!id) return c.json({ success: false, error: "ID wajib ada" }, 400);
    await c.env.DB.prepare("UPDATE transactions SET deleted_at = NULL WHERE id = ?").bind(id).run();
    return c.json({ success: true, message: "Transaksi berhasil dipulihkan" });
  } catch (error) {
    console.error("Finance RESTORE Error:", error);
    return c.json({ success: false, error: "Gagal memulihkan transaksi" }, 500);
  }
})

// Notifications Endpoints
app.get('/api/notifications', getNotifications)
app.put('/api/notifications', markNotificationsRead)
app.post('/api/notifications', createNotification)

// Search Endpoints
app.get('/api/search', getSearchResults)

// Alumni Endpoints
app.get('/api/alumni', getAlumniList)
app.post('/api/alumni', createAlumni)

export default app
