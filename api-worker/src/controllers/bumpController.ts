import { Context } from 'hono'
import { Env } from '../index'

// --- Inventori BUMP ---
export const getInventory = async (c: Context<{ Bindings: Env }>) => {
  try {
    const { results } = await c.env.DB.prepare("SELECT * FROM bump_inventory ORDER BY nama_barang ASC").all()
    return c.json({ success: true, data: results })
  } catch (error) {
    console.error("Error getInventory:", error)
    return c.json({ success: false, error: "Gagal mengambil data inventori" }, 500)
  }
}

export const addInventoryItem = async (c: Context<{ Bindings: Env }>) => {
  try {
    const body = await c.req.json()
    const { nama_barang, sku, harga_beli, harga_jual, stok, kategori } = body

    if (!nama_barang || !sku || harga_beli === undefined || harga_jual === undefined) {
      return c.json({ success: false, error: "Data wajib diisi" }, 400)
    }

    await c.env.DB.prepare(`
      INSERT INTO bump_inventory (nama_barang, sku, harga_beli, harga_jual, stok, kategori)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(nama_barang, sku, harga_beli, harga_jual, stok || 0, kategori || 'Umum').run()

    return c.json({ success: true, message: "Barang berhasil ditambahkan ke inventori" })
  } catch (error) {
    console.error("Error addInventoryItem:", error)
    return c.json({ success: false, error: "Gagal menambahkan barang" }, 500)
  }
}

// --- Checkout Kasir POS ---
export const checkoutPOS = async (c: Context<{ Bindings: Env }>) => {
  try {
    const body = await c.req.json()
    const { items, total_amount, metode_bayar } = body // items: { id: number, quantity: number, price: number }[]

    if (!items || items.length === 0 || !total_amount) {
      return c.json({ success: false, error: "Keranjang belanja kosong" }, 400)
    }

    const invoiceNum = `INV-BUMP-${Date.now()}`
    const dateStr = new Date().toISOString().split('T')[0]

    // Buat database batch statements
    const statements: D1PreparedStatement[] = []

    // 1. Simpan header penjualan BUMP
    statements.push(
      c.env.DB.prepare(`
        INSERT INTO bump_sales (sales_number, total_amount, metode_bayar)
        VALUES (?, ?, ?)
      `).bind(invoiceNum, total_amount, metode_bayar || 'Tunai')
    )

    // 2. Simpan item detail, update stok inventori
    // Karena batch D1 butuh binding, kita siapkan per item
    // Kita gunakan subquery/trigger atau prepare terpisah
    for (const item of items) {
      statements.push(
        c.env.DB.prepare(`
          INSERT INTO bump_sales_items (sales_id, item_id, quantity, price)
          VALUES ((SELECT id FROM bump_sales WHERE sales_number = ?), ?, ?, ?)
        `).bind(invoiceNum, item.id, item.quantity, item.price)
      )

      statements.push(
        c.env.DB.prepare(`
          UPDATE bump_inventory 
          SET stok = stok - ? 
          WHERE id = ?
        `).bind(item.quantity, item.id)
      )
    }

    // 3. Masukkan ke laporan transaksi keuangan utama (Pemasukan)
    const logDesc = `Setoran Penjualan BUMP (${metode_bayar || 'Tunai'}) - ${invoiceNum}`
    statements.push(
      c.env.DB.prepare(`
        INSERT INTO transactions (type, category, amount, description, date)
        VALUES ('Pemasukan', 'Unit Usaha BUMP', ?, ?, ?)
      `).bind(total_amount, logDesc, dateStr)
    )

    // Eksekusi D1 Batch
    await c.env.DB.batch(statements)

    return c.json({ success: true, message: "Transaksi POS berhasil diproses dan masuk ledger keuangan!", invoice: invoiceNum })
  } catch (error) {
    console.error("Error checkoutPOS:", error)
    return c.json({ success: false, error: "Gagal memproses transaksi kasir" }, 500)
  }
}

// --- Laporan Rekap Penjualan BUMP ---
export const getSalesReport = async (c: Context<{ Bindings: Env }>) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT s.*, 
             (SELECT COUNT(*) FROM bump_sales_items WHERE sales_id = s.id) as total_items
      FROM bump_sales s
      ORDER BY s.created_at DESC
    `).all()
    return c.json({ success: true, data: results })
  } catch (error) {
    console.error("Error getSalesReport:", error)
    return c.json({ success: false, error: "Gagal mengambil rekap penjualan" }, 500)
  }
}
