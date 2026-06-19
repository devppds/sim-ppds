import { Hono } from 'hono'
import { Env } from '../index'
import {
  getMediaBookings,
  createMediaBookings,
  updateMediaBookings,
  deleteMediaBookings,
  getMediaTickets,
  createMediaTickets,
  updateMediaTickets,
  deleteMediaTickets,
} from '../controllers/mediaController'

const mediaRoutes = new Hono<{ Bindings: Env }>()

// media_bookings
mediaRoutes.get('/media_bookings', getMediaBookings)
mediaRoutes.post('/media_bookings', createMediaBookings)
mediaRoutes.put('/media_bookings/:id', updateMediaBookings)
mediaRoutes.delete('/media_bookings/:id', deleteMediaBookings)

// media_tickets
mediaRoutes.get('/media_tickets', getMediaTickets)
mediaRoutes.post('/media_tickets', createMediaTickets)
mediaRoutes.put('/media_tickets/:id', updateMediaTickets)
mediaRoutes.delete('/media_tickets/:id', deleteMediaTickets)

export default mediaRoutes
