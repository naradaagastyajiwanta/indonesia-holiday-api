const fs = require('fs');
const content = fs.readFileSync('./api/index.ts', 'utf8');
const fixedSVG = \
  app.get("/api/og", async (req, res) => {
    const today = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" })).toISOString().split("T")[0];
    const requestedDate = typeof req.query.date === 'string' ? req.query.date : today;
    const holidays = await getHolidays();
    const h = holidays.find(hol => hol.holiday_date === requestedDate);

    const title = h ? "SELAMAT HARI LIBUR" : "HARI KERJA BIASA";
    const subtitle = h ? h.holiday_name.toUpperCase() : "Tetap Semangat & Produktif!";
    const bgColor = h ? "url(#grad)" : "#1F2937";
    const bgGrad = h ? '<linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#ef4444;stop-opacity:1" /><stop offset="100%" style="stop-color:#991b1b;stop-opacity:1" /></linearGradient>' : '';    
    const svg = '<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg"><defs>' + bgGrad + '<style>.title { font: 700 75px sans-serif; fill: white; text-anchor: middle; } .subtitle { font: 500 45px sans-serif; fill: #ffd700; text-anchor: middle; } .date { font: 400 35px sans-serif; fill: #e5e7eb; text-anchor: middle; }</style></defs><rect width="1200" height="630" fill="' + bgColor + '" /><text x="600" y="280" class="title">' + title + '</text><text x="600" y="360" class="subtitle">' + subtitle + '</text><text x="600" y="440" class="date">' + requestedDate + '</text><text x="600" y="580" style="font: 30px sans-serif; fill: #9ca3af; text-anchor: middle;">indonesia-holiday-api.vercel.app</text></svg>';
                                                   
    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(svg);
  });
\;

let newContent = content.replace(/app\.get\("\/api\/og"[\s\S]*?res\.send\(svg\);\s+\}\);/, fixedSVG.trim());
fs.writeFileSync('./api/index.ts', newContent);
