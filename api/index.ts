import express from "express";
import cors from "cors";
import ical from "ical";
import https from "https";

const app = express();
app.use(cors());

// Serve static landing page
app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Indonesia National Holiday API</title>
    <style>
        :root { --primary: #EF4444; --surface: #F9FAFB; --text-main: #111827; --text-muted: #6B7280; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: var(--surface); color: var(--text-main); line-height: 1.6; margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
        .container { background: white; max-width: 600px; padding: 3rem; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06); text-align: center; border-top: 5px solid var(--primary); }
        h1 { font-size: 2rem; margin-bottom: 0.5rem; color: var(--text-main); }
        p.subtitle { color: var(--text-muted); font-size: 1.1rem; margin-bottom: 2rem; }
        .endpoint-card { background-color: var(--surface); border: 1px solid #E5E7EB; border-radius: 0.5rem; padding: 1.5rem; text-align: left; margin-bottom: 1.5rem; }
        .endpoint { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid #E5E7EB; }
        .endpoint:last-child { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }
        .badge { background-color: #10B981; color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.8rem; font-weight: bold; letter-spacing: 0.05em; }
        a { color: #3B82F6; text-decoration: none; font-weight: 500; }
        a:hover { text-decoration: underline; }
        .footer { margin-top: 2rem; font-size: 0.9rem; color: var(--text-muted); }
    </style>
</head>
<body>
<div class="container">
    <h1>🇮🇩 Indonesia Holiday API</h1>
    <p class="subtitle">A free, fast, and auto-updating JSON API for Indonesian National & Joint Holidays.</p>
    <div class="endpoint-card">
        <div class="endpoint"><span class="badge">GET</span><span><a href="/api" target="_blank">/api</a></span></div>
        <div class="endpoint"><span class="badge">GET</span><span><a href="/api/2026" target="_blank">/api/2026</a> (By Year)</span></div>
        <div class="endpoint"><span class="badge">GET</span><span><a href="/api/2026/04" target="_blank">/api/2026/04</a> (By Month)</span></div>
    </div>
    <p>Read the full documentation and usage examples on our GitHub repository.</p>
    <div class="footer"><a href="https://github.com/naradaagastyajiwanta/indonesia-holiday-api" target="_blank">View Documentation on GitHub ↗</a></div>
</div>
</body>
</html>
  `);
});

const CALENDAR_URL = "https://calendar.google.com/calendar/ical/id.indonesian%23holiday%40group.v.calendar.google.com/public/basic.ics";

// Types
export interface Holiday {
  holiday_date: string;
  holiday_name: string;
  is_national_holiday: boolean;
  is_joint_holiday: boolean;
}

// In-memory cache
let cachedHolidays: Holiday[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

async function fetchFromGoogleCalendar(): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(CALENDAR_URL, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to fetch ICS, status code: ${res.statusCode}`));
      }
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => resolve(data));
    }).on("error", (err) => reject(err));
  });
}

async function getHolidays(): Promise<Holiday[]> {
  const now = Date.now();
  if (cachedHolidays && (now - lastFetchTime < CACHE_TTL)) {
    return cachedHolidays;
  }

  try {
    const icsData = await fetchFromGoogleCalendar();
    const events = ical.parseICS(icsData);
    
    const holidaysMap = new Map<string, Holiday>();

    for (const key in events) {
      const event = events[key];
      if (event.type === 'VEVENT') {
        const dateObj = event.start;
        if (!dateObj) continue;
        
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        
        const summary = event.summary || '';
        const isJointHoliday = summary.toLowerCase().includes('cuti bersama');
        const cleanName = summary.replace(/^(Cuti Bersama|Hari Libur Nasional)\s*(?:-|:)?\s*/i, '').trim();

        if (holidaysMap.has(dateStr)) {
          const existing = holidaysMap.get(dateStr)!;
          if (isJointHoliday) {
            existing.is_joint_holiday = true;
          } else {
            existing.is_national_holiday = true;
            existing.holiday_name = cleanName; // Prefer the national holiday name
          }
        } else {
          holidaysMap.set(dateStr, {
            holiday_date: dateStr,
            holiday_name: cleanName,
            is_national_holiday: !isJointHoliday,
            is_joint_holiday: isJointHoliday
          });
        }
      }
    }

    const holidays = Array.from(holidaysMap.values()).sort((a, b) => 
      a.holiday_date.localeCompare(b.holiday_date)
    );

    cachedHolidays = holidays;
    lastFetchTime = now;
    return holidays;
  } catch (error) {
    if (cachedHolidays) {
      return cachedHolidays; // Return stale cache if error occurs
    }
    throw error;
  }
}

app.get("/api", async (req, res) => {
  try {
    const holidays = await getHolidays();
    res.json(holidays);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch holidays" });
  }
});

app.get("/api/:year", async (req, res) => {
  try {
    const year = req.params.year;
    const holidays = await getHolidays();
    const filtered = holidays.filter(h => h.holiday_date.startsWith(year));
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch holidays" });
  }
});

app.get("/api/:year/:month", async (req, res) => {
  try {
    const year = req.params.year;
    const month = req.params.month.padStart(2, '0');
    const holidays = await getHolidays();
    const filtered = holidays.filter(h => h.holiday_date.startsWith(`${year}-${month}`));
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch holidays" });
  }
});

export default app;