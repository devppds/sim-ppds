import { Hono } from 'hono'
import { Env } from '../index'
import {
  getJadwalPengajian,
  createJadwalPengajian,
  getIzinSekolah,
  createIzinSekolah,
  updateIzinSekolahStatus,
  getBimbinganLogs,
  createBimbinganLog
} from '../controllers/pendidikanController'

const pendidikanRoutes = new Hono<{ Bindings: Env }>()

// Jadwal Pengajian
pendidikanRoutes.get('/jadwal', getJadwalPengajian)
pendidikanRoutes.post('/jadwal', createJadwalPengajian)

// Izin Sekolah / Musyawarah
pendidikanRoutes.get('/izin-sekolah', getIzinSekolah)
pendidikanRoutes.post('/izin-sekolah', createIzinSekolah)
pendidikanRoutes.put('/izin-sekolah/:id', updateIzinSekolahStatus)

// Bimbingan BK
pendidikanRoutes.get('/bimbingan', getBimbinganLogs)
pendidikanRoutes.post('/bimbingan', createBimbinganLog)

export default pendidikanRoutes
