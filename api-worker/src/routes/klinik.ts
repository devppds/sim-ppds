import { Hono } from 'hono'
import { Env } from '../index'
import {
  getMedicalRecords,
  createMedicalRecord,
  getSuratSakit,
  createSuratSakit
} from '../controllers/klinikController'

const klinikRoutes = new Hono<{ Bindings: Env }>()

// Medical records
klinikRoutes.get('/records', getMedicalRecords)
klinikRoutes.post('/records', createMedicalRecord)

// Sickness letters
klinikRoutes.get('/surat-sakit', getSuratSakit)
klinikRoutes.post('/surat-sakit', createSuratSakit)

export default klinikRoutes
