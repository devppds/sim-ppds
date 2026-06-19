import { Hono } from 'hono'
import { Env } from '../index'
import {
  getJamiyyahEvents,
  createJamiyyahEvents,
  updateJamiyyahEvents,
  deleteJamiyyahEvents,
  getJamiyyahAssets,
  createJamiyyahAssets,
  updateJamiyyahAssets,
  deleteJamiyyahAssets,
} from '../controllers/jamiyyahController'

const jamiyyahRoutes = new Hono<{ Bindings: Env }>()

// jamiyyah_events
jamiyyahRoutes.get('/jamiyyah_events', getJamiyyahEvents)
jamiyyahRoutes.post('/jamiyyah_events', createJamiyyahEvents)
jamiyyahRoutes.put('/jamiyyah_events/:id', updateJamiyyahEvents)
jamiyyahRoutes.delete('/jamiyyah_events/:id', deleteJamiyyahEvents)

// jamiyyah_assets
jamiyyahRoutes.get('/jamiyyah_assets', getJamiyyahAssets)
jamiyyahRoutes.post('/jamiyyah_assets', createJamiyyahAssets)
jamiyyahRoutes.put('/jamiyyah_assets/:id', updateJamiyyahAssets)
jamiyyahRoutes.delete('/jamiyyah_assets/:id', deleteJamiyyahAssets)

export default jamiyyahRoutes
