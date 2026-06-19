import { Hono } from 'hono'
import { Env } from '../index'
import { getSantriPaginated, createSantri, updateSantri, deleteSantri, createSantriBulk, getSantriDetail } from '../controllers/santriController'

const santriRoutes = new Hono<{ Bindings: Env }>()

santriRoutes.get('/', getSantriPaginated)
santriRoutes.get('/:id/detail', getSantriDetail)
santriRoutes.post('/', createSantri)
santriRoutes.post('/bulk', createSantriBulk)
santriRoutes.put('/:id', updateSantri)
santriRoutes.delete('/:id', deleteSantri)

export default santriRoutes
