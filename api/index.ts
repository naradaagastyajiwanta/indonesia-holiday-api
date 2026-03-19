import express from "express";
import cors from "cors";
import ical from "ical";
import https from "https";

const app = express();
app.use(cors());

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