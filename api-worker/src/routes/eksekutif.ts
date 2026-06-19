import { Hono } from 'hono'
import { Env } from '../index'
import { 
  getApprovals, 
  createApproval, 
  updateApprovalStatus, 
  getFinancialSummary, 
  getAgenda, 
  createAgenda, 
  updateAgenda, 
  deleteAgenda 
} from '../controllers/eksekutifController'

const eksekutifRoutes = new Hono<{ Bindings: Env }>()

// Approvals
eksekutifRoutes.get('/approvals', getApprovals)
eksekutifRoutes.post('/approvals', createApproval)
eksekutifRoutes.put('/approvals/:id', updateApprovalStatus)

// Stats / Financial Summary
eksekutifRoutes.get('/summary', getFinancialSummary)

// Calendar / Agenda
eksekutifRoutes.get('/calendar', getAgenda)
eksekutifRoutes.post('/calendar', createAgenda)
eksekutifRoutes.put('/calendar/:id', updateAgenda)
eksekutifRoutes.delete('/calendar/:id', deleteAgenda)

export default eksekutifRoutes
