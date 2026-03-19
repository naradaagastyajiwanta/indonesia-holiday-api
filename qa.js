const ical = require('node-ical');
const CALENDAR_URL = 'https://calendar.google.com/calendar/ical/id.indonesian%23holiday%40group.v.calendar.google.com/public/basic.ics';

async function runTest() {
  console.log('Fetching Google Calendar...');
  try {
    const events = await ical.async.fromURL(CALENDAR_URL);
    const holidays = [];
    for (const key in events) {
      if (events.hasOwnProperty(key)) {
        const event = events[key];
        if (event.type === 'VEVENT') {
          const eventDate = new Date(event.start);
          const yyyy = eventDate.getFullYear();
          const mm = String(eventDate.getMonth() + 1).padStart(2, '0');
          const dd = String(eventDate.getDate()).padStart(2, '0');
          
          let summary = event.summary || '';
          if (typeof summary !== 'string') {
              summary = String(summary.val || summary);
          }
          
          holidays.push({
            holiday_date: `${yyyy}-${mm}-${dd}`,
            holiday_name: summary,
            is_national_holiday: true,
            is_joint_holiday: summary.toLowerCase().includes('cuti bersama')
          });
        }
      }
    }
    
    holidays.sort((a, b) => a.holiday_date.localeCompare(b.holiday_date));
    
    console.log(`Total Events Parsed: ${holidays.length}`);
    
    const h2026 = holidays.filter(h => h.holiday_date.startsWith('2026'));
    console.log(`Events in 2026: ${h2026.length}`);
    if (h2026.length > 0) {
      console.log('Sample 1 (2026):', h2026[0]);
    }
    
    const h2024 = holidays.filter(h => h.holiday_date.startsWith('2024'));
    console.log(`Events in 2024: ${h2024.length}`);
    if(h2024.length > 0) {
       console.log('Sample 2024 (Month 04):', h2024.filter(h => h.holiday_date.startsWith('2024-04'))[0]);
    }
    
    console.log('QA: COMPLETE ✅');
  } catch (err) {
    console.error('QA: FAILED ❌', err);
  }
}
runTest();
