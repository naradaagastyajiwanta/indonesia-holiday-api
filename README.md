<div align="center">
  <img src="https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/javascript/javascript.png" height="50" alt="JavaScript" /> 
  <img src="https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/typescript/typescript.png" height="50" alt="TypeScript" />
  <img src="https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/nodejs/nodejs.png" height="50" alt="Node.js" />
  <img src="https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/graphql/graphql.png" height="50" alt="GraphQL" />
  <br/><br/>
  
  <h1>🇮🇩 Indonesia National Holiday API</h1>
  <p>A free, open-source, blazing-fast, and <b>auto-updating</b> API serving National Holidays & Joint Holidays <i>(Cuti Bersama)</i> in Indonesia.</p>

  <p>
    <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="License: MIT"></a>
    <a href="https://www.npmjs.com/package/indonesia-holiday-id"><img src="https://img.shields.io/npm/v/indonesia-holiday-id?color=red&style=for-the-badge" alt="NPM Version"></a>
    <a href="https://expressjs.com/"><img src="https://img.shields.io/badge/Built%20with-Express-lightgrey.svg?style=for-the-badge&logo=express" alt="Framework: Express"></a>
    <a href="https://vercel.com/"><img src="https://img.shields.io/badge/Deployed%20on-Vercel-black.svg?style=for-the-badge&logo=vercel" alt="Deploy: Vercel"></a>
    <img src="https://img.shields.io/badge/Cache-Upstash_Redis-F61C0D?style=for-the-badge&logo=redis" alt="Cache: Redis">
    <a href="https://github.com/naradaagastyajiwanta/indonesia-holiday-api/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/naradaagastyajiwanta/indonesia-holiday-api/ci.yml?style=for-the-badge&logo=github&label=Tests" alt="Test Status"></a>
  </p>
</div>

---

## 🌟 Features / Why is this API different?

Most public APIs rely on static JSON files that require manual updates every time the government (*SKB 3 Menteri*) announces schedule adjustments. **This API is different:**

1. **🤖 Auto-Pilot (Zero Maintenance)**: Dynamically fetches directly from the **Google Calendar ICS feed** for the Indonesian locale. Any official updates by Google are instantly reflected here.
2. **⚡ Blazing Fast & Enterprise Ready**: Built on **Express**, mapped to **Vercel Serverless/Edge**, and backed persistently by **Upstash Redis**. Response times are microsecond-fast.
3. **🕸️ Next-Gen Protocols**: Supports not only standard **REST** endpoints but also offers a fully typed **GraphQL** API and exports into .ics / CSV.
4. **📦 Built-in SDK**: Provides an official **NPM Package** for effortless Node.js integration.
5. **🔓 100% Free**: No API keys, no registration, no rate-limiting headaches.

---

## 🚀 Live Demo & Documentation

**Base API URL:**
\https://indonesia-holiday-api.vercel.app\

Interactive sandboxes are pre-built to test queries before implementing them in your code:
* 📖 **[REST OpenAPI / Swagger UI](https://indonesia-holiday-api.vercel.app/api-docs)** 
* 🕸️ **[GraphQL GraphiQL Sandbox](https://indonesia-holiday-api.vercel.app/graphql)**

---

## 🔌 1. API Endpoints (REST)

The standard response is a JSON Array containing objects with the following schema:
* \holiday_date\ *(String, YYYY-MM-DD)*
* \holiday_name\ *(String)*
* \is_national_holiday\ *(Boolean)*
* \is_joint_holiday\ *(Boolean) - Indicates "Cuti Bersama"*

### 📅 Standard Lookups
* **Get All Holidays (Since 2013):** \GET /api\
* **Get Holidays by Year:** \GET /api/2026\
* **Get Holidays by Year & Month:** \GET /api/2026/03\ *(Zero-padding is handled automatically)*

### 🤖 Bot & Automation Endpoints
Perfect for Discord/Telegram bots, Slack integrations, and Daily CRON jobs!
* **Check Today's Holiday:** \GET /api/today\ *(Returns HTTP 200 with object if today is a holiday, otherwise returns empty/null)*
* **Get Next Upcoming Holiday:** \GET /api/next\ *(Useful for countdowns!)*

### 🛠️ Advanced Filters & Modifiers
Tailor the API response to fit your exact needs by appending Query Strings (\?\):

| Need | Route Example | Description |
| :--- | :--- | :--- |
| **English Translation** | \/api/2026/03?lang=en\ | Translates names into English using a custom dictionary |
| **Search Keyword** | \/api/2026?search=cuti\ | Filters the output for a specific word/phrase |
| **iCal Export** | \/api/2026?format=ics\ | Generates an \.ics\ file directly importable to Apple/Google/Outlook Calendars |
| **CSV Export** | \/api/2026?format=csv\ | Generates an Excel-friendly CSV table layout |

---

## 🕸️ 2. GraphQL API

Want exactly what you need with zero overfetching? We provide a fully-functional GraphQL implementation powered by **GraphQL Yoga**.

* **Endpoint**: \POST /graphql\

**Example Query:**
\\\graphql
query {
  holidays(year: 2026, lang: "en", month: "03") {
    holiday_date
    holiday_name
  }
}
\\\

---

## 📦 3. Node.js SDK

For Node.js / TypeScript developers, you don't even need to use \etch\ or \xios\. Use our official wrapper SDK!

### Installation
\\\ash
npm install indonesia-holiday-id
\\\

### Usage
\\\	ypescript
import { IndonesiaHoliday } from "indonesia-holiday-id";

async function run() {
  // 1. Get holidays for the whole year of 2026
  const holidays = await IndonesiaHoliday.getHolidays(2026);
  
  // 2. See if today is a red calendar day!
  const isTodayHoliday = await IndonesiaHoliday.today();
  if (isTodayHoliday) {
    console.log(Don't go to work! It's );
  }

  // 3. Keep track of the next time you get a day off
  const nextHoliday = await IndonesiaHoliday.next();
  console.log(Hang in there! The next break is on );
}

run();
\\\

---

## 💻 Language Examples (REST)

<details>
<summary><strong>JavaScript / TypeScript (Browser/React/Vue)</strong></summary>

\\\javascript
fetch('https://indonesia-holiday-api.vercel.app/api/2026/08')
  .then(res => res.json())
  .then(data => {
    data.forEach(holiday => {
      console.log(Holiday Alert:  => );
    });
  });
\\\
</details>

<details>
<summary><strong>Python (Requests)</strong></summary>

\\\python
import requests

url = "https://indonesia-holiday-api.vercel.app/api/today"
response = requests.get(url)

if response.text and response.json():
    print(f"Hooray! Today is {response.json()['holiday_name']}")
else:
    print("Today is a regular working day.")
\\\
</details>

<details>
<summary><strong>PHP (cURL)</strong></summary>

\\\php
<?php
 = file_get_contents('https://indonesia-holiday-api.vercel.app/api/next?lang=en');
 = json_decode(, true);

echo "Next holiday is " . ['holiday_name'] . " on " . ['holiday_date'];
?>
\\\
</details>

---

## 🛠️ Local Development & Contributing

Want to run this API natively on your machine or contribute to the source code? We welcome PRs!

1. **Clone the repository:**
   \\\ash
   git clone https://github.com/naradaagastyajiwanta/indonesia-holiday-api.git
   \\\
2. **Install dependencies:**
   \\\ash
   cd indonesia-holiday-api
   npm install
   \\\
3. **Run local server with hot-reload:**
   \\\ash
   npm run dev
   \\\
   *(The API will run at \http://localhost:3000\)*
4. **Run Unit Tests (Jest):**
   \\\ash
   npm test
   \\\

## 📄 License
This project is open-sourced under the **[MIT License](https://opensource.org/licenses/MIT)**. Feel free to use, fork, commercialize, or integrate this into any project without permission!
