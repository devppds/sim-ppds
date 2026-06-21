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
  createPelanggaran,
  getKendaraan,
  createKendaraan,
  getElektronik,
  createElektronik,
  getKompor,
  createKompor,
  getTransaksi,
  createTransaksi,
  updateTransaksi
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

// Kendaraan
keamananRoutes.get('/kendaraan', getKendaraan)
keamananRoutes.post('/kendaraan', createKendaraan)

// Elektronik
keamananRoutes.get('/elektronik', getElektronik)
keamananRoutes.post('/elektronik', createElektronik)

// Kompor
keamananRoutes.get('/kompor', getKompor)
keamananRoutes.post('/kompor', createKompor)

// Transaksi
keamananRoutes.get('/transaksi', getTransaksi)
keamananRoutes.post('/transaksi', createTransaksi)
keamananRoutes.put('/transaksi/:id', updateTransaksi)

export default keamananRoutes
