import { Hono } from 'hono'
import { Env } from '../index'
import {
  getTakmirSchedules,
  createTakmirSchedules,
  updateTakmirSchedules,
  deleteTakmirSchedules,
  getTakmirBookings,
  createTakmirBookings,
  updateTakmirBookings,
  deleteTakmirBookings,
} from '../controllers/takmirController'

const takmirRoutes = new Hono<{ Bindings: Env }>()

// takmir_schedules
takmirRoutes.get('/takmir_schedules', getTakmirSchedules)
takmirRoutes.post('/takmir_schedules', createTakmirSchedules)
takmirRoutes.put('/takmir_schedules/:id', updateTakmirSchedules)
takmirRoutes.delete('/takmir_schedules/:id', deleteTakmirSchedules)

// takmir_bookings
takmirRoutes.get('/takmir_bookings', getTakmirBookings)
takmirRoutes.post('/takmir_bookings', createTakmirBookings)
takmirRoutes.put('/takmir_bookings/:id', updateTakmirBookings)
takmirRoutes.delete('/takmir_bookings/:id', deleteTakmirBookings)

export default takmirRoutes
