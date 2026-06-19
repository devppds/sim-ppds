import { Hono } from 'hono'
import { Env } from '../index'
import { 
  getClearanceList, 
  applyClearance, 
  checkClearanceStatus, 
  updateClearanceCheckpoint, 
  deleteClearance 
} from '../controllers/clearanceController'

const clearanceRoutes = new Hono<{ Bindings: Env }>()

clearanceRoutes.get('/', getClearanceList)
clearanceRoutes.post('/', applyClearance)
clearanceRoutes.get('/check-status', checkClearanceStatus)
clearanceRoutes.put('/:id', updateClearanceCheckpoint)
clearanceRoutes.delete('/:id', deleteClearance)

export default clearanceRoutes
