<div align="center">
  <h1>🇮🇩 API Hari Libur Nasional Indonesia</h1>
  <p>API gratis, open-source, sangat cepat, dan <b>auto-update</b> untuk data Hari Libur Nasional & Cuti Bersama di Indonesia.</p>

  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Framework: Hono](https://img.shields.io/badge/Built%20with-Hono-orange.svg)](https://hono.dev/)
  [![Deploy: Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black.svg)](https://vercel.com)
</div>

---

## 🌟 Kenapa API Ini Berbeda?

Sebagian besar API hari libur menggunakan database statis atau file JSON yang harus diupdate manual setiap kali SKB 3 Menteri diubah oleh pemerintah. API ini **berbeda**:

1. **🤖 Auto-Pilot (Tanpa Pemeliharaan Manual)**: Menggunakan teknik proxy ke *Google Calendar Public API* khusus wilayah Indonesia. Jika ada perubahan libur dari pemerintah, Google akan memperbarui kalendarnya, dan API ini **otomatis** menyesuaikan datanya secara *real-time*.
2. **⚡ Blazing Fast**: Dibangun menggunakan framework **Hono** di atas arsitektur *Edge / Serverless* (Vercel) dengan in-memory cache 24-jam. Response time sangat rendah (rata-rata di bawah 50ms).
3. **🔓 100% Gratis & Tanpa API Key**: Tidak perlu registrasi, tidak butuh token. Langsung *hit* *endpoint*-nya di project Anda.

---

## 🚀 Penggunaan (API Endpoints)

**Base URL Standar:** *(Ganti dengan URL Vercel/Cloudflare Anda apabila ditarik untuk production)*  
`https://indonesia-holiday-api.vercel.app` *(Contoh URL)*

Bentuk format balasan (*response*) dari semua endpoint adalah **JSON Array** berisikan object berikut:
* `holiday_date` (String, YYYY-MM-DD)
* `holiday_name` (String)
* `is_national_holiday` (Boolean)
* `is_joint_holiday` (Boolean) - *Menandakan apakah ini Cuti Bersama atau bukan*

### 1. Ambil Semua Data
Mengambil semua data libur yang tersedia dari *stream* Google Calendar.

```http
GET /api
```

### 2. Ambil Berdasarkan Tahun
Mengambil semua hari libur dan cuti bersama di tahun spesifik.

```http
GET /api/2026
```

**Contoh Response:**
```json
[
  {
    "holiday_date": "2026-01-01",
    "holiday_name": "Tahun Baru Masehi",
    "is_national_holiday": true,
    "is_joint_holiday": false
  },
  {
    "holiday_date": "2026-02-17",
    "holiday_name": "Cuti Bersama Isra Mikraj Nabi Muhammad SAW",
    "is_national_holiday": true,
    "is_joint_holiday": true
  }
]
```

### 3. Ambil Berdasarkan Tahun & Bulan
Sangat berguna untuk dirender dalam UI Kalender bulanan. Endpoint ini otomatis menerima *padding* angka nol (misal: `/2026/3` akan dibaca `/2026/03`).

```http
GET /api/2026/03
```

---

## 💻 Contoh *Code Snippet* Implementasi

Berikut adalah contoh cara menggunakan API ini di berbagai bahasa pemrograman.

<details>
<summary><strong>JavaScript (Fetch / React / Vue)</strong></summary>

```javascript
// Dapatkan libur bulan Agustus 2026
fetch('https://NAMADOMAINANDA.vercel.app/api/2026/08')
  .then(response => response.json())
  .then(data => {
    console.log(data);
    data.forEach(holiday => {
      console.log(`Tanggal: ${holiday.holiday_date} - ${holiday.holiday_name}`);
    });
  })
  .catch(error => console.error('Error:', error));
```
</details>

<details>
<summary><strong>Python (Requests)</strong></summary>

```python
import requests

url = "https://NAMADOMAINANDA.vercel.app/api/2026"
response = requests.get(url)

if response.status_code == 200:
    for libur in response.json():
        if (libur['is_joint_holiday']):
            print(f"Cuti Bersama: {libur['holiday_name']}")
```
</details>

<details>
<summary><strong>PHP (cURL)</strong></summary>

```php
<?php
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://NAMADOMAINANDA.vercel.app/api/2026/12");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
$output = curl_exec($ch);
curl_close($ch);

$data = json_decode($output, true);
print_r($data);
?>
```
</details>

---

## 🛠️ Pengembangan Lokal (Local Development)

Ingin mengubah kode atau berkontribusi? Node.js Minimum `v18+` sangat disarankan.

1.  **Clone repositori ini:**
    ```bash
    git clone https://github.com/naradaagastyajiwanta/indonesia-holiday-api.git
    ```
2.  **Masuk ke folder:**
    ```bash
    cd indonesia-holiday-api
    ```
3.  **Install semua dependencies (Hono, Node-iCal, TS):**
    ```bash
    npm install
    ```
4.  **Jalankan environment lokal untuk di-test:**
    ```bash
    npm run dev
    ```
    *Akan terbuka localhost port biasanya 3000 untuk melakukan pengetesan*.

## 🤝 Kontribusi

Pull Request *(PR)* dan Laporan *Issue* sangat kami harapkan. Jika Anda menemukan bug pada sistem parsing Kalender, silakan buat tiket di halaman **Issues**.

## 📄 Lisensi
Di bawah lisensi [MIT](https://opensource.org/licenses/MIT). Anda bebas menggunakan, memodifikasi, mendistribusikan, dan memonetisasi integrasi darinya.