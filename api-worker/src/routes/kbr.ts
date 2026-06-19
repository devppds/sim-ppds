import { Hono } from 'hono'
import { Env } from '../index'
import {
  getKbrHygieneChecks,
  createKbrHygieneChecks,
  updateKbrHygieneChecks,
  deleteKbrHygieneChecks,
} from '../controllers/kbrController'

const kbrRoutes = new Hono<{ Bindings: Env }>()

// kbr_hygiene_checks
kbrRoutes.get('/kbr_hygiene_checks', getKbrHygieneChecks)
kbrRoutes.post('/kbr_hygiene_checks', createKbrHygieneChecks)
kbrRoutes.put('/kbr_hygiene_checks/:id', updateKbrHygieneChecks)
kbrRoutes.delete('/kbr_hygiene_checks/:id', deleteKbrHygieneChecks)

export default kbrRoutes
