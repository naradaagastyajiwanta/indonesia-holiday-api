# API Hari Libur Nasional Indonesia 🇮🇩

API gratis, open-source, dan berkinerja tinggi untuk mengambil data Hari Libur Nasional & Cuti Bersama di Indonesia.

Dibangun dengan **TypeScript + Hono**, ditenagai oleh sinkronisasi otomatis menggunakan **Google Calendar Public ID**.

## Kenapa API ini lebih baik?
1. **Tidak Ada Base Database 🚫🗄️**: Kami mem-*proxy* kalender resmi Google. Jika pemerintah RI mengetuk SKB 3 menteri dan Google Calendar memperbarui datanya, API ini akan otomatis memberikan respon data terbaru tanpa update manual ke repo.
2. **Sangat Cepat ⚡**: Di-cache in-memory selama 24 Jam. Response API dalam hitungan milisecond.
3. **No Auth / Zero Config 🛡️**: Tidak perlu daftar, tidak pakai API Key. Langsung Hit!

## URL Base Limit
`(Deploy dan masukkan URL mu disini)`
Misal: `https://api-libur-id.vercel.app`

## Endpoints

### 1. Dapatkan Seluruh Libur
**Request:** `GET /api`

### 2. Dapatkan Libur Per Tahun
**Request:** `GET /api/2026`

**Response (`200 OK`):**
```json
[
  {
    "holiday_date": "2026-01-01",
    "holiday_name": "Tahun Baru Masehi",
    "is_national_holiday": true,
    "is_joint_holiday": false
  },
  {
    "holiday_date": "2026-03-20",
    "holiday_name": "Hari Raya Idul Fitri 1447 Hijriah",
    "is_national_holiday": true,
    "is_joint_holiday": false
  }
]
```

### 3. Dapatkan Libur Per Bulan
**Request:** `GET /api/2026/03` *(Otomatis padding `0` jika dikirim /2026/3)*


## Cara Install / Kontribusi Lokal

Syarat: Node.js Minimum >= 18

1. Clone repo: `git clone https://github.com/username/api-hari-libur.git`
2. Pindah ke direktori: `cd api-hari-libur`
3. Install package: `npm install`
4. Jalankan lokal: `npx vercel dev`

## Lisensi
MIT License
