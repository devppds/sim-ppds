import { Hono } from 'hono'
import { Env } from '../index'
import { paySPP, getSPPConfig, addSPPConfig, deleteSPPConfig, getSPP } from '../controllers/sppController'

const sppRoutes = new Hono<{ Bindings: Env }>()

sppRoutes.get('/', getSPP)
sppRoutes.post('/', paySPP)
sppRoutes.get('/config', getSPPConfig)
sppRoutes.post('/config', addSPPConfig)
sppRoutes.delete('/config/:id', deleteSPPConfig)

export default sppRoutes
