import { Hono } from 'hono'
import { Env } from '../index'
import {
  getBookingPerlengkapan,
  createBookingPerlengkapan,
  updateBookingPerlengkapanStatus,
  getChecklistKebersihan,
  createChecklistKebersihan
} from '../controllers/logistikController'

const logistikRoutes = new Hono<{ Bindings: Env }>()

// Bookings
logistikRoutes.get('/bookings', getBookingPerlengkapan)
logistikRoutes.post('/bookings', createBookingPerlengkapan)
logistikRoutes.put('/bookings/:id', updateBookingPerlengkapanStatus)

// Hygiene tracker
logistikRoutes.get('/kebersihan', getChecklistKebersihan)
logistikRoutes.post('/kebersihan', createChecklistKebersihan)

export default logistikRoutes
