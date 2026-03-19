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
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background-color: #fafafa; color: #171717; display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 20px; line-height: 1.5; }
        .container { max-width: 560px; width: 100%; background: #ffffff; padding: 48px; border-radius: 20px; border: 1px solid #eaeaea; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04); }
        h1 { font-size: 24px; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 8px; color: #111; display: flex; align-items: center; gap: 8px; }
        p.description { color: #666; font-size: 15px; margin-bottom: 32px; }
        .endpoints { display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px; }
        .endpoint { background: #fafafa; border: 1px solid #eaeaea; padding: 14px 16px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; transition: all 0.2s ease; }
        .endpoint:hover { border-color: #d4d4d4; background: #fff; transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0,0,0,0.02); }
        .endpoint-left { display: flex; align-items: center; gap: 14px; }
        .method { font-size: 11px; font-weight: 600; background: #111; color: #fff; padding: 4px 8px; border-radius: 6px; letter-spacing: 0.5px; }
        .path { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 14px; color: #111; text-decoration: none; font-weight: 500;}
        .path:hover { text-decoration: underline; }
        .desc { font-size: 13px; color: #888; }
        .footer { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; padding-top: 24px; border-top: 1px solid #eaeaea; font-size: 13px; }
        .github-link { color: #111; text-decoration: none; font-weight: 500; display: inline-flex; align-items: center; gap: 6px; transition: opacity 0.2s; }
        .github-link:hover { opacity: 0.6; }
        .credit { color: #888; }
        .credit span { color: #111; font-weight: 600; letter-spacing: -0.01em; }
    </style>
</head>
<body>
<div class="container">
    <h1>🇮🇩 Indonesia Holiday API</h1>
    <p class="description">A minimalistic, auto-updating JSON API for Indonesian National & Joint Holidays.</p>
    
    <div class="endpoints">
        <div class="endpoint">
            <div class="endpoint-left">
                <span class="method">GET</span>
                <a href="/api" target="_blank" class="path">/api</a>
            </div>
            <span class="desc">All Data</span>
        </div>
        <div class="endpoint">
            <div class="endpoint-left">
                <span class="method">GET</span>
                <a href="/api/2026" target="_blank" class="path">/api/2026</a>
            </div>
            <span class="desc">By Year</span>
        </div>
        <div class="endpoint">
            <div class="endpoint-left">
                <span class="method">GET</span>
                <a href="/api/2026/04" target="_blank" class="path">/api/2026/04</a>
            </div>
            <span class="desc">By Month</span>
        </div>
    </div>
    
    <div class="footer">
        <a href="https://github.com/naradaagastyajiwanta/indonesia-holiday-api" target="_blank" class="github-link">
            <svg height="16" aria-hidden="true" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" fill="currentColor"><path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path></svg>
            GitHub
        </a>
        <div class="credit">By <span>NAJ</span></div>
    </div>
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