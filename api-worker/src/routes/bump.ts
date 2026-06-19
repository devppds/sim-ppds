import { Hono } from 'hono'
import { Env } from '../index'
import {
  getInventory,
  addInventoryItem,
  checkoutPOS,
  getSalesReport
} from '../controllers/bumpController'

const bumpRoutes = new Hono<{ Bindings: Env }>()

// Inventory
bumpRoutes.get('/inventory', getInventory)
bumpRoutes.post('/inventory', addInventoryItem)

// Cashier POS
bumpRoutes.post('/checkout', checkoutPOS)

// Sales report
bumpRoutes.get('/sales', getSalesReport)

export default bumpRoutes
