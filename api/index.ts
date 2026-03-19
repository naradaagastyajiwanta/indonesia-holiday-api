import express from "express";
import cors from "cors";
import ical from "ical";
import https from "https";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createSchema, createYoga } from "graphql-yoga";
import { Redis } from "@upstash/redis";

const app = express();
app.use(express.json()); // Allow parsing JSON for webhooks

// --- NEW FEATURES: Wikipedia Helper --- //
async function getWikipediaSummary(query: string, lang = "id"): Promise<string | null> {
  try {
    const wikiDomain = lang === "en" ? "en" : "id";
    const searchUrl = `https://${wikiDomain}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json`;
    const searchRaw = await fetch(searchUrl);
    const searchJson = await searchRaw.json();
    if (searchJson.query.search.length > 0) {
      const title = searchJson.query.search[0].title;
      const summaryUrl = `https://${wikiDomain}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
      const summaryRaw = await fetch(summaryUrl);
      const summaryJson = await summaryRaw.json();
      return summaryJson.extract || null;
    }
    return null;
  } catch(e) {
    return null;
  }
}


app.set("trust proxy", 1);
app.use(helmet({ contentSecurityPolicy: false })); // allow swagger inline scripts if needed

const apiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: "Too many requests from this IP, please try again after 10 minutes" }
});

const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Indonesia Public Holidays API",
    description: "API Data Hari Libur Nasional dan Cuti Bersama di Indonesia. Bersumber dari Google Calendar.",
    version: "1.0.0",
  },
  servers: [
    {
      url: "https://indonesia-holiday-api.vercel.app/api",
      description: "Production Server",
    },
    {
      url: "/api",
      description: "Local/Relative",
    },
  ],
  paths: {
    "/today": {
      get: {
        summary: "Get today's holiday",
        description: "Returns today's holiday if any. Useful for bot/HRIS automation.",
        parameters: [
          { name: "lang", in: "query", description: "Bahasa response (en untuk Inggris)", required: false, schema: { type: "string", enum: ["id", "en"], default: "id" } },
        ],
        responses: {
          "200": {
            description: "Holiday object array (empty if not a holiday)"
          }
        }
      }
    },
    "/next": {
      get: {
        summary: "Get next upcoming holiday",
        description: "Returns the closest upcoming holiday relative to today.",
        parameters: [
          { name: "lang", in: "query", description: "Bahasa response (en untuk Inggris)", required: false, schema: { type: "string", enum: ["id", "en"], default: "id" } },
        ],
        responses: {
          "200": {
            description: "Holiday object array (1 item)"
          }
        }
      }
    },
    "/{year}": {
      get: {
        summary: "Get holidays for a specific year",
        description: "Retrieve list of public holidays and joint holidays in a specific year.",
        parameters: [
          { name: "year", in: "path", required: true, schema: { type: "integer" }, example: 2024 },
          { name: "start", in: "query", description: "Mulai (Start) Range (YYYY-MM-DD)", required: false, schema: { type: "string", format: "date" } },
          { name: "end", in: "query", description: "Selesai (End) Range (YYYY-MM-DD)", required: false, schema: { type: "string", format: "date" } },
          { name: "search", in: "query", description: "Pencarian spesifik berdasarkan kata kunci", required: false, schema: { type: "string" } },
          { name: "lang", in: "query", description: "Bahasa response (en untuk Inggris)", required: false, schema: { type: "string", enum: ["id", "en"], default: "id" } },
          { name: "format", in: "query", description: "Format response (json, csv, atau ics)", required: false, schema: { type: "string", enum: ["json", "csv", "ics"], default: "json" } },
        ],
        responses: {
          "200": {
            description: "Daftar tanggal merah dan cuti bersama",
            content: {
              "application/json": {
                example: [
                  { date: "2024-01-01", name: "Tahun Baru Masehi", isNationalHoliday: true, isJointHoliday: false }
                ]
              }
            }
          }
        }
      }
    },
    "/{year}/{month}": {
      get: {
        summary: "Get holidays for a specific month",
        description: "Retrieve list of holidays in a specific month of a specific year. Format {month} is 01-12.",
        parameters: [
          { name: "year", in: "path", required: true, schema: { type: "integer" }, example: 2024 },
          { name: "month", in: "path", required: true, schema: { type: "string" }, example: "04" },
        ],
        responses: {
          "200": {
            description: "Daftar tanggal merah dan cuti bersama di bulan tersebut",
            content: {
              "application/json": {
                example: [
                  { date: "2024-04-10", name: "Hari Raya Idul Fitri", isNationalHoliday: true, isJointHoliday: false }
                ]
              }
            }
          }
        }
      }
    }
  }
};

// Swagger specific route, HTML via CDN for serverless compatibility
app.get("/api-docs", (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Indonesia Holiday API - Swagger UI</title>
      <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
      <style>
        body { margin: 0; padding: 0; }
        .swagger-ui .topbar { display: none; }
      </style>
    </head>
    <body>
      <div id="swagger-ui"></div>
      <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js" crossorigin></script>
      <script>
        window.onload = () => {
          window.ui = SwaggerUIBundle({
            spec: ${JSON.stringify(swaggerDocument)},
            dom_id: '#swagger-ui',
          });
        };
      </script>
    </body>
    </html>
  `;
  res.send(html);
});

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
        <div class="endpoint">
            <div class="endpoint-left">
                <span class="method">GET</span>
                <a href="/api/today" target="_blank" class="path">/api/today</a>
            </div>
            <span class="desc">Today's Holiday</span>
        </div>
        <div class="endpoint">
            <div class="endpoint-left">
                <span class="method">GET</span>
                <a href="/api/next" target="_blank" class="path">/api/next</a>
            </div>
            <span class="desc">Upcoming Holiday</span>
        </div>
        <div class="endpoint">
            <div class="endpoint-left">
                <span class="method">GET</span>
                <a href="/api/2026?lang=en" target="_blank" class="path">/?lang=en</a>
            </div>
            <span class="desc">English Translation</span>
        </div>
        <div class="endpoint">
            <div class="endpoint-left">
                <span class="method">GET</span>
                <a href="/api/2026?format=ics" target="_blank" class="path">/?format=ics</a>
            </div>
            <span class="desc">iCal Export</span>
        </div>
        <div class="endpoint">
            <div class="endpoint-left">
                <span class="method" style="background:#49cc90;">UI</span>
                <a href="/api-docs" class="path">/api-docs</a>
            </div>
            <span class="desc">Swagger Docs</span>
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

// In-memory cache fallback
let cachedHolidays: Holiday[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Edge Redis Cache
let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

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
  
  if (redis) {
    try {
      const edgeCache = await redis.get<Holiday[]>("holidays_data");
      if (edgeCache) return edgeCache;
    } catch (e) {
      console.error("Redis Cache Error:", e);
    }
  } else {
    if (cachedHolidays && (now - lastFetchTime < CACHE_TTL)) {
      return cachedHolidays;
    }
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

    if (redis) {
      // 24 hours caching in Redis
      await redis.set("holidays_data", holidays, { ex: 86400 }).catch(e => console.error(e));
    } else {
      cachedHolidays = holidays;
      lastFetchTime = now;
    }
    
    return holidays;
  } catch (error) {
    if (redis) {
      try {
        const stale = await redis.get<Holiday[]>("holidays_data");
        if (stale) return stale;
      } catch (e) { }
    } else if (cachedHolidays) {
      return cachedHolidays; // Return stale cache if error occurs
    }
    throw error;
  }
}

app.use("/api", apiLimiter, (req, res, next) => {
  res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate");
  next();
});

const enTranslationDict: Record<string, string> = {
  "tahun baru masehi": "New Year's Day",
  "tahun baru imlek": "Chinese New Year",
  "hari suci nyepi": "Day of Silence (Nyepi)",
  "jumat agung": "Good Friday",
  "wafat yesus kristus": "Good Friday",
  "wafat isa almasih": "Good Friday",
  "hari raya idul fitri": "Eid al-Fitr",
  "hari buruh internasional": "Labour Day",
  "kenaikan yesus kristus": "Ascension Day of Jesus Christ",
  "kenaikan isa almasih": "Ascension Day of Jesus Christ",
  "hari raya waisak": "Waisak Day",
  "hari lahir pancasila": "Pancasila Day",
  "hari raya idul adha": "Eid al-Adha",
  "tahun baru islam": "Islamic New Year",
  "kemerdekaan ri": "Independence Day",
  "kemerdekaan republik indonesia": "Independence Day",
  "maulid nabi muhammad": "Prophet Muhammad's Birthday",
  "hari raya natal": "Christmas Day",
  "isra mikraj": "Isra Mi'raj",
  "isra mi'raj": "Isra Mi'raj",
  "pemungutan suara": "Election Day",
};

function translateHoliday(name: string): string {
  const lowerName = name.toLowerCase();
  for (const [key, value] of Object.entries(enTranslationDict)) {
    if (lowerName.includes(key)) {
      if (lowerName.includes("cuti bersama")) return `Joint Holiday of ${value}`;
      return value;
    }
  }
  if (lowerName.includes("cuti bersama")) return "Joint Holiday";
  return name;
}

function buildICS(holidays: Holiday[]): string {
  let ics = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Indonesia Holiday API//ID\nCALSCALE:GREGORIAN\n";
  for (const h of holidays) {
      const dateClean = h.holiday_date.replace(/-/g, ""); 
      const nextDay = new Date(h.holiday_date);
      nextDay.setDate(nextDay.getDate() + 1);
      const endClean = nextDay.toISOString().split("T")[0].replace(/-/g, "");
      
      ics += "BEGIN:VEVENT\n";
      ics += `UID:${dateClean}-${Math.floor(Math.random()*10000)}@indonesia-holiday-api\n`;
      ics += `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"}\n`;
      ics += `DTSTART;VALUE=DATE:${dateClean}\n`;
      ics += `DTEND;VALUE=DATE:${endClean}\n`;
      ics += `SUMMARY:${h.holiday_name}\n`;
      ics += "END:VEVENT\n";
  }
  ics += "END:VCALENDAR";
  return ics;
}

function processHolidays(req: express.Request, res: express.Response, holidays: Holiday[]) {
  let result = holidays;
  
  // Apply translation if lang=en
  if (req.query.lang === 'en') {
    result = result.map(h => ({ ...h, holiday_name: translateHoliday(h.holiday_name) }));
  }
  
  // 1. Filter by Date Range (start and end)
  if (req.query.start || req.query.end) {
    const startDate = req.query.start ? String(req.query.start) : "0000-00-00";
    const endDate = req.query.end ? String(req.query.end) : "9999-12-31";
    result = result.filter(h => h.holiday_date >= startDate && h.holiday_date <= endDate);
  }

  // 2. Filter by search keyword
  if (req.query.search) {
    const keyword = String(req.query.search).toLowerCase();
    result = result.filter(h => h.holiday_name.toLowerCase().includes(keyword));
  }

  // 3. Format as CSV or ICS if requested
  if (req.query.format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="holidays.csv"');
    const header = "holiday_date,holiday_name,is_national_holiday,is_joint_holiday";
    const rows = result.map(h => 
      `${h.holiday_date},"${h.holiday_name.replace(/"/g, '""')}",${h.is_national_holiday},${h.is_joint_holiday}`
    );
    return res.send([header, ...rows].join('\n'));
  }
  
  if (req.query.format === 'ics') {
    res.setHeader('Content-Type', 'text/calendar');
    res.setHeader('Content-Disposition', 'attachment; filename="holidays.ics"');
    return res.send(buildICS(result));
  }

  return res.json(result);
}

// -------------------------------------------------------------
// ROUTES
// -------------------------------------------------------------

app.get("/api/today", async (req, res) => {
  try {
    const holidays = await getHolidays();
    const today = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" })).toISOString().split("T")[0];
    const todayHolidays = holidays.filter(h => h.holiday_date === today);
    processHolidays(req, res, todayHolidays);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch holidays" });
  }
});

app.get("/api/next", async (req, res) => {
  try {
    const holidays = await getHolidays();
    const today = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" })).toISOString().split("T")[0];
    const nextHolidays = holidays.filter(h => h.holiday_date >= today);
    const result = nextHolidays.length > 0 ? [nextHolidays[0]] : [];
    processHolidays(req, res, result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch holidays" });
  }
});

app.get("/api", async (req, res) => {
  try {
    const holidays = await getHolidays();
    processHolidays(req, res, holidays);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch holidays" });
  }
});

app.get("/api/:year", async (req, res) => {
  try {
    const year = req.params.year;
    const holidays = await getHolidays();
    const filtered = holidays.filter(h => h.holiday_date.startsWith(year));
    processHolidays(req, res, filtered);
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
    processHolidays(req, res, filtered);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch holidays" });
  }
});

// -------------------------------------------------------------
// GRAPHQL ENDPOINT
// -------------------------------------------------------------
const yoga = createYoga({
  graphqlEndpoint: '/graphql',
  schema: createSchema({
    typeDefs: `
      type Holiday {
        holiday_date: String!
        holiday_name: String!
        is_national_holiday: Boolean!
        is_joint_holiday: Boolean!
      }
      type Query {
        holidays(year: Int, month: String, search: String, lang: String): [Holiday!]!
        today(lang: String): [Holiday!]!
        next(lang: String): [Holiday!]!
      }
    `,
    resolvers: {
      Query: {
        holidays: async (_, args) => {
          let hols = await getHolidays();
          if (args.year) hols = hols.filter(h => h.holiday_date.startsWith(args.year.toString()));
          if (args.month) hols = hols.filter(h => h.holiday_date.substring(5, 7) === args.month.padStart(2, '0'));
          if (args.search) {
            const kw = args.search.toLowerCase();
            hols = hols.filter(h => h.holiday_name.toLowerCase().includes(kw));
          }
          if (args.lang === 'en') {
            hols = hols.map(h => ({ ...h, holiday_name: translateHoliday(h.holiday_name) }));
          }
          return hols;
        },
        today: async (_, args) => {
          let hols = await getHolidays();
          const t = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" })).toISOString().split("T")[0];
          hols = hols.filter(h => h.holiday_date === t);
          if (args.lang === 'en') {
            hols = hols.map(h => ({ ...h, holiday_name: translateHoliday(h.holiday_name) }));
          }
          return hols;
        },
        next: async (_, args) => {
          let hols = await getHolidays();
          const t = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" })).toISOString().split("T")[0];
          hols = hols.filter(h => h.holiday_date >= t);
          let res = hols.length > 0 ? [hols[0]] : [];
          if (args.lang === 'en') {
            res = res.map(h => ({ ...h, holiday_name: translateHoliday(h.holiday_name) }));
          }
          return res;
        }
      }
    }
  })
});
app.use('/graphql', yoga);
  app.get("/api", async (req, res) => {
    try {
      const holidays = await getHolidays();
      processHolidays(req, res, holidays);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch holidays" });
    }
  });

  // --- NEW FEATURES: Data Enrichment & Images & Webhooks --- //
  app.get("/api/info", async (req, res) => {
    try {
      const query = typeof req.query.search === 'string' ? req.query.search : "Hari Libur Nasional Indonesia";
      const lang = typeof req.query.lang === 'string' ? req.query.lang : "id";
      
      const cacheKey = \wiki_\_\\;
      let info = null;
      if (redis) info = await redis.get<string>(cacheKey);
      if (!info) {
         info = await getWikipediaSummary(query, lang);
         if (info && redis) await redis.set(cacheKey, info, { ex: 60 * 60 * 24 * 7 });
      }
      res.json({ search: query, info: info || "Tidak ada informasi detail yang ditemukan." });
    } catch {
      res.status(500).json({ error: "Failed to fetch info" });
    }
  });

  app.get("/api/og", async (req, res) => {
    const today = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" })).toISOString().split("T")[0];
    const requestedDate = typeof req.query.date === 'string' ? req.query.date : today;
    const holidays = await getHolidays();
    const h = holidays.find(hol => hol.holiday_date === requestedDate);
    
    const title = h ? "SELAMAT HARI LIBUR" : "HARI KERJA BIASA";
    const subtitle = h ? h.holiday_name.toUpperCase() : "Tetap Semangat & Produktif!";
    const bgColor = h ? "url(#grad)" : "#1F2937";
    const bgGrad = h ? \<linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#ef4444;stop-opacity:1" /><stop offset="100%" style="stop-color:#991b1b;stop-opacity:1" /></linearGradient>\ : '';

    const svg = \<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg"><defs>\<style>.title { font: 700 75px sans-serif; fill: white; text-anchor: middle; } .subtitle { font: 500 45px sans-serif; fill: #ffd700; text-anchor: middle; } .date { font: 400 35px sans-serif; fill: #e5e7eb; text-anchor: middle; }</style></defs><rect width="1200" height="630" fill="\" /><text x="600" y="280" class="title">\</text><text x="600" y="360" class="subtitle">\</text><text x="600" y="440" class="date">\</text><text x="600" y="580" style="font: 30px sans-serif; fill: #9ca3af; text-anchor: middle;">indonesia-holiday-api.vercel.app</text></svg>\;

    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(svg);
  });

  app.post("/api/webhooks/subscribe", async (req, res) => {
    if (!redis) return res.status(500).json({ error: "Storage not configured." });
    const { webhook_url } = req.body;
    if (!webhook_url || !webhook_url.startsWith("http")) return res.status(400).json({ error: "Invalid webhook_url" });
    try {
      const current = await redis.get<string[]>("webhooks") || [];
      if (!current.includes(webhook_url)) {
        current.push(webhook_url);
        await redis.set("webhooks", current);
      }
      res.json({ message: "Successfully subscribed!", url: webhook_url });
    } catch(e) { res.status(500).json({ error: "Failed to save webhook" }); }
  });

  app.post("/api/webhooks/trigger", async (req, res) => {
     if (!redis) return res.status(500).json({ error: "Storage not configured." });
     try {
        const tomorrowRaw = new Date(); tomorrowRaw.setDate(tomorrowRaw.getDate() + 1);
        const tomorrow = new Date(tomorrowRaw.toLocaleString("en-US", { timeZone: "Asia/Jakarta" })).toISOString().split("T")[0];
        const holidays = await getHolidays();
        const tomorrowHoliday = holidays.find(h => h.holiday_date === tomorrow);
        if (tomorrowHoliday) {
            const subscribers = await redis.get<string[]>("webhooks") || [];
            let sent = 0;
            await Promise.all(subscribers.map(url => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'upcoming_holiday', data: tomorrowHoliday }) }).then(() => sent++).catch(() => {})));
            res.json({ message: "Trigger executed", holiday: tomorrowHoliday, notified: sent });
        } else {
            res.json({ message: "No holiday tomorrow. Nothing triggered." });
        }
     } catch (e) { res.status(500).json({ error: "Failed to trigger webhooks" }); }
  });

export default app;
