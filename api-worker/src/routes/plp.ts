import { Hono } from 'hono'
import { Env } from '../index'
import {
  getPlpMeters,
  createPlpMeters,
  updatePlpMeters,
  deletePlpMeters,
  getPlpTickets,
  createPlpTickets,
  updatePlpTickets,
  deletePlpTickets,
} from '../controllers/plpController'

const plpRoutes = new Hono<{ Bindings: Env }>()

// plp_meters
plpRoutes.get('/plp_meters', getPlpMeters)
plpRoutes.post('/plp_meters', createPlpMeters)
plpRoutes.put('/plp_meters/:id', updatePlpMeters)
plpRoutes.delete('/plp_meters/:id', deletePlpMeters)

// plp_tickets
plpRoutes.get('/plp_tickets', getPlpTickets)
plpRoutes.post('/plp_tickets', createPlpTickets)
plpRoutes.put('/plp_tickets/:id', updatePlpTickets)
plpRoutes.delete('/plp_tickets/:id', deletePlpTickets)

export default plpRoutes
