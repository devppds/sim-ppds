import { Hono } from 'hono'
import { Env } from '../index'
import { paySPP } from '../controllers/sppController'

const sppRoutes = new Hono<{ Bindings: Env }>()

sppRoutes.post('/', paySPP)

export default sppRoutes
