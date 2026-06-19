import { Hono } from 'hono'
import { Env } from '../index'
import {
  getTickets,
  createTicket,
  updateTicketStatus,
  getBookings,
  createBooking,
  updateBookingStatus,
  getJadwalPetugas,
  createJadwalPetugas
} from '../controllers/fasilitasController'

const fasilitasRoutes = new Hono<{ Bindings: Env }>()

// Tickets perbaikan
fasilitasRoutes.get('/tickets', getTickets)
fasilitasRoutes.post('/tickets', createTicket)
fasilitasRoutes.put('/tickets/:id', updateTicketStatus)

// Bookings masjid
fasilitasRoutes.get('/bookings', getBookings)
fasilitasRoutes.post('/bookings', createBooking)
fasilitasRoutes.put('/bookings/:id', updateBookingStatus)

// Jadwal petugas
fasilitasRoutes.get('/jadwal', getJadwalPetugas)
fasilitasRoutes.post('/jadwal', createJadwalPetugas)

export default fasilitasRoutes
