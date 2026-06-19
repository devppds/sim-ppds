import { Hono } from 'hono'
import { Env } from '../index'
import {
  getPresensiWajar,
  createPresensiWajar,
  getUbudiyyahTracker,
  createUbudiyyahTracker
} from '../controllers/wajarController'

const wajarRoutes = new Hono<{ Bindings: Env }>()

// Presensi
wajarRoutes.get('/presensi', getPresensiWajar)
wajarRoutes.post('/presensi', createPresensiWajar)

// Ubudiyyah Tracker
wajarRoutes.get('/ubudiyyah', getUbudiyyahTracker)
wajarRoutes.post('/ubudiyyah', createUbudiyyahTracker)

export default wajarRoutes
