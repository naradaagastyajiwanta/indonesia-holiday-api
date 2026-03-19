import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import ical from 'node-ical'

const app = new Hono()

// URL kalender publik Google khusus "Holidays in Indonesia" 
// (Selalu diupdate oleh Google Indonesia)
const CALENDAR_URL = 'https://calendar.google.com/calendar/ical/id.indonesian%23holiday%40group.v.calendar.google.com/public/basic.ics';

// In-memory cache supaya tidak gampang Rate Limit dari Google
let cachedHolidays: any = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 Jam cache

async function getHolidays() {
  const now = Date.now();
  // Return dari cache jika data masih "segar" (belum lewat 24 jam)
  if (cachedHolidays && (now - lastFetchTime < CACHE_TTL_MS)) {
    return cachedHolidays;
  }

  try {
    const events = await ical.async.fromURL(CALENDAR_URL);
    const holidays = [];

    for (const key in events) {
      if (events.hasOwnProperty(key)) {
        const event = events[key];
        
        // Memastikan tipe event adalah VEVENT dan bukan format meta lainnya
        if (event.type === 'VEVENT') {
          // Format tanggal menjadi YYYY-MM-DD
          const eventDate = new Date(event.start);
          const yyyy = eventDate.getFullYear();
          const mm = String(eventDate.getMonth() + 1).padStart(2, '0');
          const dd = String(eventDate.getDate()).padStart(2, '0');
          
          const formattedDate = `${yyyy}-${mm}-${dd}`;
          
          // Memisahkan kategori Libur / Cuti Bersama
          let summary = event.summary as any;
          if (summary && typeof summary !== 'string') {
            summary = summary.val || String(summary);
          } else {
            summary = String(summary || '');
          }

          const isJointHoliday = summary.toLowerCase().includes('cuti bersama');

          holidays.push({
            holiday_date: formattedDate,
            holiday_name: summary,
            is_national_holiday: true, // Google calendar mayoritas isinya adalah libur nasional RI
            is_joint_holiday: isJointHoliday
          });
        }
      }
    }

    // Urutkan berdasarkan tanggal termuda - tertua
    holidays.sort((a, b) => a.holiday_date.localeCompare(b.holiday_date));

    // Update Cache
    cachedHolidays = holidays;
    lastFetchTime = now;
    
    return holidays;
  } catch (error) {
    console.error('Error fetching calendar:', error);
    throw new Error('Gagal mengambil data dari Google Calendar');
  }
}

// -------------------
// ROUTER ENDPOINTS
// -------------------

// 1. Root API - Menampilkan welcome & dokumentasi sederhana
app.get('/', (c) => {
  return c.json({
    message: 'API Hari Libur Nasional Indonesia (Live Update memantau Google Calendar)',
    status: 'success',
    endpoints: {
      all_data: '/api',
      by_year: '/api/:year (contoh: /api/2026)',
      by_month: '/api/:year/:month (contoh: /api/2026/03)'
    },
    author: 'Open Source Repo'
  })
})

// 2. Fetch semua data (Semua Tahun yang tersedia dari Google ID)
app.get('/api', async (c) => {
  try {
    const data = await getHolidays();
    return c.json(data);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
})

// 3. Fetch berdasarkan Tahun
app.get('/api/:year', async (c) => {
  const year = c.req.param('year');
  try {
    const data = await getHolidays();
    const filtered = data.filter((h: any) => h.holiday_date.startsWith(year));
    return c.json(filtered);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
})

// 4. Fetch berdasarkan Tahun dan Bulan
app.get('/api/:year/:month', async (c) => {
  const year = c.req.param('year');
  let month = c.req.param('month');
  
  // Pad angka 1 karakter menjadi 2 (misal: "3" menjadi "03")
  if (month.length === 1) month = `0${month}`;

  try {
    const data = await getHolidays();
    const filtered = data.filter((h: any) => h.holiday_date.startsWith(`${year}-${month}`));
    return c.json(filtered);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
})

export default handle(app)
