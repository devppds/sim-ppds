import { Context } from 'hono'
import { Env } from '../index'

// --- Tiket Perbaikan ---
export const getTickets = async (c: Context<{ Bindings: Env }>) => {
  try {
    const { results } = await c.env.DB.prepare("SELECT * FROM tiket_perbaikan ORDER BY created_at DESC").all()
    return c.json({ success: true, data: results })
  } catch (error) {
    console.error("Error getTickets:", error)
    return c.json({ success: false, error: "Gagal mengambil tiket perbaikan" }, 500)
  }
}

export const createTicket = async (c: Context<{ Bindings: Env }>) => {
  try {
    const body = await c.req.json()
    const { pelapor, lokasi, deskripsi, kategori, prioritas } = body

    if (!pelapor || !lokasi || !deskripsi) {
      return c.json({ success: false, error: "Data wajib diisi" }, 400)
    }

    await c.env.DB.prepare(`
      INSERT INTO tiket_perbaikan (pelapor, lokasi, deskripsi, kategori, prioritas, status)
      VALUES (?, ?, ?, ?, ?, 'Menunggu')
    `).bind(pelapor, lokasi, deskripsi, kategori || 'Lainnya', prioritas || 'Sedang').run()

    return c.json({ success: true, message: "Tiket perbaikan berhasil diajukan" })
  } catch (error) {
    console.error("Error createTicket:", error)
    return c.json({ success: false, error: "Gagal membuat tiket perbaikan" }, 500)
  }
}

export const updateTicketStatus = async (c: Context<{ Bindings: Env }>) => {
  try {
    const id = c.req.param('id')
    const body = await c.req.json()
    const { status, petugas } = body

    if (!id || !status) {
      return c.json({ success: false, error: "ID dan status wajib ada" }, 400)
    }

    await c.env.DB.prepare(`
      UPDATE tiket_perbaikan SET status = ?, petugas = ? WHERE id = ?
    `).bind(status, petugas || 'Petugas PLP', id).run()

    return c.json({ success: true, message: "Status tiket berhasil diperbarui" })
  } catch (error) {
    console.error("Error updateTicketStatus:", error)
    return c.json({ success: false, error: "Gagal memperbarui status tiket" }, 500)
  }
}

// --- Booking Masjid ---
export const getBookings = async (c: Context<{ Bindings: Env }>) => {
  try {
    const { results } = await c.env.DB.prepare("SELECT * FROM booking_masjid ORDER BY waktu_mulai DESC").all()
    return c.json({ success: true, data: results })
  } catch (error) {
    console.error("Error getBookings:", error)
    return c.json({ success: false, error: "Gagal mengambil data booking" }, 500)
  }
}

export const createBooking = async (c: Context<{ Bindings: Env }>) => {
  try {
    const body = await c.req.json()
    const { nama_kegiatan, pemohon, waktu_mulai, waktu_selesai, keterangan } = body

    if (!nama_kegiatan || !pemohon || !waktu_mulai || !waktu_selesai) {
      return c.json({ success: false, error: "Data wajib diisi" }, 400)
    }

    await c.env.DB.prepare(`
      INSERT INTO booking_masjid (nama_kegiatan, pemohon, waktu_mulai, waktu_selesai, status, keterangan)
      VALUES (?, ?, ?, ?, 'Diajukan', ?)
    `).bind(nama_kegiatan, pemohon, waktu_mulai, waktu_selesai, keterangan || '').run()

    return c.json({ success: true, message: "Booking masjid berhasil diajukan" })
  } catch (error) {
    console.error("Error createBooking:", error)
    return c.json({ success: false, error: "Gagal mengajukan booking" }, 500)
  }
}

export const updateBookingStatus = async (c: Context<{ Bindings: Env }>) => {
  try {
    const id = c.req.param('id')
    const body = await c.req.json()
    const { status } = body

    if (!id || !status) {
      return c.json({ success: false, error: "ID dan status wajib ada" }, 400)
    }

    await c.env.DB.prepare(`
      UPDATE booking_masjid SET status = ? WHERE id = ?
    `).bind(status, id).run()

    return c.json({ success: true, message: "Status booking berhasil diperbarui" })
  } catch (error) {
    console.error("Error updateBookingStatus:", error)
    return c.json({ success: false, error: "Gagal memperbarui booking" }, 500)
  }
}

// --- Jadwal Petugas Masjid ---
export const getJadwalPetugas = async (c: Context<{ Bindings: Env }>) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT * FROM jadwal_petugas_masjid 
      ORDER BY 
        CASE hari
          WHEN 'Senin' THEN 1
          WHEN 'Selasa' THEN 2
          WHEN 'Rabu' THEN 3
          WHEN 'Kamis' THEN 4
          WHEN 'Jumat' THEN 5
          WHEN 'Sabtu' THEN 6
          WHEN 'Ahad' THEN 7
          ELSE 8
        END
    `).all()
    return c.json({ success: true, data: results })
  } catch (error) {
    console.error("Error getJadwalPetugas:", error)
    return c.json({ success: false, error: "Gagal mengambil jadwal petugas" }, 500)
  }
}

export const createJadwalPetugas = async (c: Context<{ Bindings: Env }>) => {
  try {
    const body = await c.req.json()
    const { hari, waktu, imam, muadzin, keterangan } = body

    if (!hari || !waktu || !imam || !muadzin) {
      return c.json({ success: false, error: "Data wajib diisi" }, 400)
    }

    await c.env.DB.prepare(`
      INSERT INTO jadwal_petugas_masjid (hari, waktu, imam, muadzin, keterangan)
      VALUES (?, ?, ?, ?, ?)
    `).bind(hari, waktu, imam, muadzin, keterangan || '').run()

    return c.json({ success: true, message: "Jadwal petugas berhasil disimpan" })
  } catch (error) {
    console.error("Error createJadwalPetugas:", error)
    return c.json({ success: false, error: "Gagal menyimpan jadwal petugas" }, 500)
  }
}
