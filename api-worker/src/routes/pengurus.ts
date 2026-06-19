import { Hono } from 'hono'
import { Env } from '../index'
import { getPengurus, addPengurus } from '../controllers/pengurusController'

const pengurusRoutes = new Hono<{ Bindings: Env }>()

// Endpoint: GET /api/pengurus
pengurusRoutes.get('/', getPengurus)

// Endpoint: POST /api/pengurus
pengurusRoutes.post('/', addPengurus)

export default pengurusRoutes
