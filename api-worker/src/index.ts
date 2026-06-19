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

export default app
