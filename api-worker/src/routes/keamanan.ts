import { Hono } from 'hono'
import { Env } from '../index'
import {
  getPerizinan,
  createPerizinan,
  updatePerizinanStatus,
  getSKKB,
  createSKKB,
  getAssets,
  createAsset,
  getPelanggaran,
  createPelanggaran
} from '../controllers/keamananController'

const keamananRoutes = new Hono<{ Bindings: Env }>()

// Perizinan
keamananRoutes.get('/perizinan', getPerizinan)
keamananRoutes.post('/perizinan', createPerizinan)
keamananRoutes.put('/perizinan/:id', updatePerizinanStatus)

// SKKB
keamananRoutes.get('/skkb', getSKKB)
keamananRoutes.post('/skkb', createSKKB)

// Assets
keamananRoutes.get('/assets', getAssets)
keamananRoutes.post('/assets', createAsset)

// Pelanggaran
keamananRoutes.get('/pelanggaran', getPelanggaran)
keamananRoutes.post('/pelanggaran', createPelanggaran)

export default keamananRoutes
