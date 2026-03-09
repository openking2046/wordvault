export default async function handler(req, res) {
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
        headings: { en: "WordVault · 今天还没练习单词哦" },
        contents: { en: "每天坚持 10 分钟，词汇量飞速增长！点击开始今天的练习 💪" },
        url: "https://wordvault-woad.vercel.app",
        ios_sound: "default",
        android_sound: "default",
        priority: 10
      })
    });

    const data = await response.json();
    return res.status(200).json({ ok: true, result: data });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
