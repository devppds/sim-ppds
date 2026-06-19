import { Hono } from 'hono'
import { Env } from '../index'
import { getSantriPaginated } from '../controllers/santriController'

const santriRoutes = new Hono<{ Bindings: Env }>()

santriRoutes.get('/', getSantriPaginated)

export default santriRoutes
