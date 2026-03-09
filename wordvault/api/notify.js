export default async function handler(req, res) {
  // Only allow GET (from Vercel Cron) or POST
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ONESIGNAL_API_KEY;
  const appId = process.env.ONESIGNAL_APP_ID;

  if (!apiKey || !appId) {
    return res.status(500).json({ error: "Missing environment variables" });
  }

  try {
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${apiKey}`
      },
      body: JSON.stringify({
        app_id: appId,
        included_segments: ["All"],
        headings: { en: "WordVault · 该学单词了" },
        contents: { en: "每天坚持，词汇量会飞速增长 ✓" },
        url: "https://wordvault-woad.vercel.app"
      })
    });

    const data = await response.json();
    return res.status(200).json({ ok: true, result: data });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
