<div align="center">
  <h1>🇮🇩 Indonesia National Holiday API</h1>
  <p>A free, open-source, blazing-fast, and <b>auto-updating</b> API for National Holidays & Joint Holidays (Cuti Bersama) in Indonesia.</p>

  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Framework: Express](https://img.shields.io/badge/Built%20with-Express-green.svg)](https://expressjs.com/)
  [![Deploy: Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black.svg)](https://vercel.com)
</div>

---

## 🌟 Why is this API different?

Most holiday APIs rely on a static database or JSON files that require manual updates whenever the Indonesian government (SKB 3 Menteri) announces calendar changes. **This API is different**:

1. **🤖 Auto-Pilot (Zero Maintenance)**: It acts as a proxy to the *Google Calendar Public API* specifically for the Indonesian region. When the government changes holidays, Google updates its calendar, and this API **automatically** reflects the changes in *real-time*.
2. **⚡ Blazing Fast**: Built with the **Express.js** framework on Edge / Serverless architecture (Vercel) utilizing a 24-hour in-memory cache and native fetch API. Response times are consistently low.
3. **🔓 100% Free & No API Key Required**: No registration, no tokens needed. Just hit the endpoint directly from your applications!

---

## 🚀 Usage (API Endpoints)

**Live Base URL:**  
`https://indonesia-holiday-api.vercel.app`

Interactive OpenAPI / Swagger Docs are explicitly available at:  
👉 **[Swagger UI Docs](https://indonesia-holiday-api.vercel.app/api-docs)**

The response format for all endpoints is a **JSON Array** containing objects with the following structure:
* `holiday_date` (String, YYYY-MM-DD)
* `holiday_name` (String)
* `is_national_holiday` (Boolean)
* `is_joint_holiday` (Boolean) - *Indicates whether the date is a "Cuti Bersama" (Joint Holiday)*

### 1. Get All Holidays
Fetches all available holiday data provided by the Google Calendar stream.

```http
GET /api
```

### 2. Get Holidays by Year
Fetches all national and joint holidays for a specific year.

```http
GET /api/2026
```

**Example Response:**
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

### 3. Get Holidays by Year & Month
Extremely useful for rendering monthly calendar UIs. This endpoint automatically handles zero-padding (e.g., `/2026/3` is evaluated as `/2026/03`).

```http
GET /api/2026/03
```

### 4. Advanced Filters (Search, Date Range & CSV)
You can append query strings to any of the endpoints above to narrow down your results or change the response format.

* **Search by Name:**
  ```http
  GET /api/2026?search=cuti
  GET /api?search=lebaran
  ```
* **Filter by Date Range:**
  ```http
  GET /api?start=2026-03-01&end=2026-04-30
  ```
* **Download as CSV (Excel Friendly):**
  ```http
  GET /api/2026?format=csv
  ```

---

## 💻 Implementation Snippets

Below are quick examples of how to consume this API in various programming languages.

<details>
<summary><strong>JavaScript (Fetch / React / Vue)</strong></summary>

```javascript
// Get holidays for August 2026
fetch('https://indonesia-holiday-api.vercel.app/api/2026/08')
  .then(response => response.json())
  .then(data => {
    console.log(data);
    data.forEach(holiday => {
      console.log(`Date: ${holiday.holiday_date} - ${holiday.holiday_name}`);
    });
  })
  .catch(error => console.error('Error:', error));
```
</details>

<details>
<summary><strong>Python (Requests)</strong></summary>

```python
import requests

url = "https://indonesia-holiday-api.vercel.app/api/2026"
response = requests.get(url)

if response.status_code == 200:
    for holiday in response.json():
        if holiday['is_joint_holiday']:
            print(f"Joint Holiday (Cuti Bersama): {holiday['holiday_name']}")
```
</details>

<details>
<summary><strong>PHP (cURL)</strong></summary>

```php
<?php
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://indonesia-holiday-api.vercel.app/api/2026/12");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
$output = curl_exec($ch);
curl_close($ch);

$data = json_decode($output, true);
print_r($data);
?>
```
</details>

---

## 🛠️ Local Development

Want to modify the code or contribute? Node.js `v18+` is highly recommended.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/naradaagastyajiwanta/indonesia-holiday-api.git
    ```
2.  **Navigate to the directory:**
    ```bash
    cd indonesia-holiday-api
    ```
3.  **Install dependencies (Express, CORS, iCal, TypeScript):**
    ```bash
    npm install
    ```
4.  **Run the local development server:**
    ```bash
    npm run dev
    ```
    *The server will typically spin up on `localhost:3000` for testing.*

## 🤝 Contributing

Pull Requests (PRs) and Issue reports are highly welcome! If you find any bugs with the calendar parsing system, please open a ticket in the **Issues** tab.

## 📄 License
This project is licensed under the [MIT License](https://opensource.org/licenses/MIT). You are free to use, modify, distribute, and monetize your integrations.
