import { Hono } from 'hono'
import { Env } from '../index'
import {
  getPembangunanRenovasi,
  createPembangunanRenovasi,
  updatePembangunanRenovasi,
  deletePembangunanRenovasi,
} from '../controllers/pembangunanController'

const pembangunanRoutes = new Hono<{ Bindings: Env }>()

// pembangunan_renovasi
pembangunanRoutes.get('/pembangunan_renovasi', getPembangunanRenovasi)
pembangunanRoutes.post('/pembangunan_renovasi', createPembangunanRenovasi)
pembangunanRoutes.put('/pembangunan_renovasi/:id', updatePembangunanRenovasi)
pembangunanRoutes.delete('/pembangunan_renovasi/:id', deletePembangunanRenovasi)

export default pembangunanRoutes
