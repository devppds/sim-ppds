import { Hono } from 'hono'
import { Env } from '../index'
import { getPengurus, addPengurus, updatePengurus, deletePengurus } from '../controllers/pengurusController'

const pengurusRoutes = new Hono<{ Bindings: Env }>()

// Endpoint: GET /api/pengurus
pengurusRoutes.get('/', getPengurus)

// Endpoint: POST /api/pengurus
pengurusRoutes.post('/', addPengurus)

// Endpoint: PUT /api/pengurus/:id
pengurusRoutes.put('/:id', updatePengurus)

// Endpoint: DELETE /api/pengurus/:id
pengurusRoutes.delete('/:id', deletePengurus)

export default pengurusRoutes
