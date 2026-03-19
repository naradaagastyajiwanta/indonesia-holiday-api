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

## 🌟 Features & Advantages

Most public APIs rely on static JSON files that require developers to manually push code updates every time the Indonesian government (*SKB 3 Menteri*) announces schedule adjustments. **This API is different:**

1. **🤖 Auto-Pilot (Zero Maintenance)**: Dynamically fetches directly from the **Google Calendar Feed** tailored for the Indonesian locale. Any official calendar updates are instantly reflected here.
2. **⚡ Enterprise Ready**: Built on **Express**, deployed to **Vercel Serverless/Edge**, and backed by persistent **Upstash Redis Caching**. Response times are consistently in the low milliseconds.
3. **🕸️ Next-Gen Protocols**: Supports standard **REST**, queryable **GraphQL**, and exports directly to \.ics\ or Excel \CSV\.
4. **📦 Built-in SDK**: Ships with an official NPM Package for zero-config Node.js integration.
5. **🔓 100% Free**: No API keys, no registration, no restrictive rate-limiting.

---

## 💡 Real-World Use Cases

Not sure what to build with this? Here is how this infrastructure can power your applications:

*   🏢 **HRIS & Payroll Systems**: Automatically calculate accurate working days for employee timesheets. Simply fetch the holidays for a given month and subtract them from the total weekdays.
*   🚚 **E-Commerce & Logistics**: Accurately estimate shipping ETAs. Automatically extend delivery promises or notify customers if their package processing lands on a red calendar day (*Cuti Bersama*).
*   🤖 **Discord / Telegram Bots**: Run a daily CRON job at 06:00 AM checking the \/api/today\ endpoint. If it returns an object, command your bot to broadcast: *"Good morning! No standup today, enjoy your !"*
*   📅 **Booking & Reservation Apps**: Passively disable date-pickers on your frontend UI for specific holiday dates. Vital for apps handling banking, government offices (SAMSAT, Dukcapil), or specialized clinics that close on red dates.
*   🚦 **Smart Home Automation**: Tie the API into Home Assistant. If today is a national holiday, disable the 05:30 AM bedroom alarm and change the RGB lights to a relaxed color scheme.

---

## 🚀 Live Demo & Endpoints (REST)

**Base URL:** \https://indonesia-holiday-api.vercel.app\

Interactive sandboxes are available to test queries:
👉 **[REST OpenAPI / Swagger UI](https://indonesia-holiday-api.vercel.app/api-docs)** 

The standard response is a JSON Array containing objects:
* \holiday_date\ *(YYYY-MM-DD)*
* \holiday_name\ *(String)*
* \is_national_holiday\ *(Boolean)*
* \is_joint_holiday\ *(Boolean) - Indicates "Cuti Bersama"*

### 📅 Core Endpoints
| Action | Endpoint | Example Response |
| :--- | :--- | :--- |
| **All Holidays** (Since 2013) | \GET /api\ | \[ { "holiday_date": "2013-01-01"... } ]\ |
| **Holidays by Year** | \GET /api/2026\ | \[ { "holiday_date": "2026-08-17"... } ]\ |
| **Holidays by Month** | \GET /api/2026/03\ | Filters purely for March 2026. |

### 🤖 Automation Endpoints (For Bots)
* \GET /api/today\ ➔ Returns a single JSON object if today is a holiday (returns empty if it's a regular day).
* \GET /api/next\ ➔ Returns the exact date and name of the *next* upcoming holiday. Useful for countdown timers!

### 🛠️ Advanced Modifiers
You can chain multiple query parameters to format the response exactly to your liking:
* \?lang=en\ ➔ Translates localized Indonesian holiday names to **English**.
* \?search={keyword}\ ➔ Searches for a specific string (e.g., \?search=lebaran\).
* \?format=ics\ ➔ Downloads an Apple/Google Calendar compatible file.
* \?format=csv\ ➔ Downloads an Excel compatible spreadsheet.
* **Example Chain**: \/api/2026/05?lang=en&format=csv\

---

## 💎 Enterprise & Advanced Features

This API comes packed with advanced tooling designed for bots, CI/CD operations, and modern frontend ecosystems.

### 1. 🖼️ Dynamic Open Graph (SVG) Generator
Dynamically generate beautiful SVG images on the fly depending on today's holiday context. Useful for Slack, Discord, Twitter, or WhatsApp rich link previews.
* **Endpoint:** `GET /api/og`
* **Parameter:** `?date=YYYY-MM-DD` (Optional)
* **Example:** [https://indonesia-holiday-api.vercel.app/api/og](https://indonesia-holiday-api.vercel.app/api/og)
* **Behavior:** Renders a 1200x630 red-and-gold card if it's a holiday, or a dark-themed card if it's a regular workday.

### 2. 🧠 Wikipedia AI Data Enrichment
Instead of just getting brief names, pull comprehensive historical backgrounds and explanations scraped natively from Wikipedia (cached aggressively via Upstash Redis for latency protection).
* **Endpoint:** `GET /api/info`
* **Parameters:** `?search={query}&lang={id/en}`
* **Example:**
  ```http
  GET /api/info?search=Nyepi&lang=id
  ```
  ```json
  {
    "search": "Nyepi",
    "info": "Nyepi adalah hari raya suci umat Hindu yang dirayakan setiap Tahun Baru Saka..."
  }
  ```

### 3. 🔔 Real-time Webhooks (Push Architecture)
Stop polling! Register your Slackbot, Discord bot, or server and let the API notify *you* automatically.
* **Subscribe to Webhook:**
  ```http
  POST /api/webhooks/subscribe
  Content-Type: application/json

  { "webhook_url": "https://your-domain.com/webhook" }
  ```
* **How it works:** When someone/a cron job hits `POST /api/webhooks/trigger`, the system verifies if *tomorrow* is a holiday. If yes, it broadcasts the payload concurrently to all subscribed URLs.

### 4. 🎛️ Interactive Visual Dashboard
The root endpoint `GET /` hosts a gorgeous, reactive dashboard completely written in **TailwindCSS** + **Alpine.js** without any frontend build steps.
* Visit the root URL to view holidays instantly.
* Click any holiday row to view a clean popup modal resolving detailed data fetched strictly on the fly via the Wikipedia Enrichment Engine.


## 🕸️ GraphQL API

If you want to prevent overfetching, leverage our fully typed GraphQL implementation powered by **GraphQL Yoga**.
* 🕸️ **[Access GraphiQL IDE](https://indonesia-holiday-api.vercel.app/graphql)**
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

## 📦 Node.js SDK (indonesia-holiday-id)

For Node.js / TypeScript developers, you don't even need to write \etch\ or \xios\ boilerplate. We maintain an official wrapper!

### Install
\\\ash
npm install indonesia-holiday-id
\\\

### Usage
\\\	ypescript
import { IndonesiaHoliday } from "indonesia-holiday-id";

async function run() {
  // Get all holidays in 2026
  const data = await IndonesiaHoliday.getHolidays(2026);
  
  // Check if today is a holiday
  const holidayToday = await IndonesiaHoliday.today();
  if (holidayToday) {
    console.log(Don't go to work! It's );
  }

  // Find out when the next holiday is
  const upNext = await IndonesiaHoliday.next();
  console.log(The next break is on );
}
run();
\\\

---

## 🏗️ System Architecture & Performance

To guarantee sub-100ms response times globally, we designed this with an **Edge-First Philosophy**:

1. **Client Request** ➔ Hits the **Vercel Edge Network** node geographically closest to the user's location.
2. **Upstash Redis Intercept** ➔ The Edge function securely checks the Upstash Data layer. If this specific query was already requested by someone else within the last 24 hours, Redis returns the pre-compiled JSON instantly *(Avg: ~20ms)*.
3. **Upstream Fallback** ➔ Only if the cache is empty, the backend fetches the live ICS binary dump from the Google Regional Calendar servers, parses the VEvents into JS Objects, deduplicates them, saves the resulting JSON back into Redis, and serves it to the user.

---

## 💻 Code Examples (REST)

<details>
<summary><strong>JavaScript / TypeScript (Browser/React/Vue)</strong></summary>

\\\javascript
fetch('https://indonesia-holiday-api.vercel.app/api/today')
  .then(res => res.json())
  .then(data => {
    if (Object.keys(data).length > 0) {
       alert(IT'S A HOLIDAY: );
    }
  });
\\\
</details>

<details>
<summary><strong>Python (Requests)</strong></summary>

\\\python
import requests

response = requests.get("https://indonesia-holiday-api.vercel.app/api/2026/12")
for day in response.json():
    print(f"Date: {day['holiday_date']} | Name: {day['holiday_name']}")
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

Want to run this API natively on your machine or contribute to the source code? 

1. **Clone & Install:**
   \\\ash
   git clone https://github.com/naradaagastyajiwanta/indonesia-holiday-api.git
   cd indonesia-holiday-api
   npm install
   \\\
2. **Configure Environment:** Create a \.env\ file. (To test caching, supply \UPSTASH_REDIS_REST_URL\ & \UPSTASH_REDIS_REST_TOKEN\, otherwise it safely ignores caching).
3. **Run Dev Server:**
   \\\ash
   npm run dev
   \\\
4. **Run Unit Tests (Jest / Supertest):**
   \\\ash
   npm test
   \\\

## 📄 License
Open-sourced under the **[MIT License](https://opensource.org/licenses/MIT)**. You are free to use, fork, commercialize, or integrate this into any enterprise project without explicit permission!
