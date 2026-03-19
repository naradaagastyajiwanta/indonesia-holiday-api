async function check() {
  console.log("Menghubungi Vercel...");
  try {
    const res = await fetch("https://indonesia-holiday-api-mt5i.vercel.app/api/2026/04");
    console.log("Status Code:", res.status);
    const text = await res.text();
    console.log("Response Body:", text);
  } catch (err) {
    console.error("Error:", err);
  }
}
check();
