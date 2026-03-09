// WordVault Service Worker - Daily Reminder
// Place this file in: wordvault/public/sw.js

const CACHE = "wv-sw-v1";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));

// Listen for messages from the app
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SET_NOTIF_TIME") {
    // Store the notification time in cache storage
    caches.open(CACHE).then(cache => {
      cache.put("notif-time", new Response(event.data.time));
      cache.put("notif-enabled", new Response("true"));
    });
  }
  if (event.data && event.data.type === "DISABLE_NOTIF") {
    caches.open(CACHE).then(cache => {
      cache.put("notif-enabled", new Response("false"));
    });
  }
  if (event.data && event.data.type === "TEST_NOTIF") {
    self.registration.showNotification("WordVault", {
      body: "通知测试成功！每天这个时间会提醒你学习单词。",
      icon: "/logo192.png",
      badge: "/logo192.png",
      tag: "wv-test",
    });
  }
});

// Periodic check using fetch event as a heartbeat trigger
// The app pings the SW every minute to check if it's time to notify
self.addEventListener("fetch", () => {}); // keep SW alive

// Check notification time
async function checkAndNotify() {
  try {
    const cache = await caches.open(CACHE);
    const enabledRes = await cache.match("notif-enabled");
    const enabled = enabledRes ? await enabledRes.text() : "false";
    if (enabled !== "true") return;

    const timeRes = await cache.match("notif-time");
    const savedTime = timeRes ? await timeRes.text() : null;
    if (!savedTime) return;

    const now = new Date();
    const [h, m] = savedTime.split(":").map(Number);
    const isTime = now.getHours() === h && now.getMinutes() === m;
    if (!isTime) return;

    // Check if already notified today
    const todayKey = now.toISOString().slice(0, 10);
    const lastRes = await cache.match("last-notif-date");
    const lastDate = lastRes ? await lastRes.text() : null;
    if (lastDate === todayKey) return;

    // Show notification
    await self.registration.showNotification("WordVault · 该学单词了", {
      body: "每天坚持，词汇量会飞速增长 ✓",
      icon: "/logo192.png",
      badge: "/logo192.png",
      tag: "wv-daily",
      renotify: true,
      data: { url: "/" },
    });

    // Mark today as notified
    await cache.put("last-notif-date", new Response(todayKey));
  } catch (e) {}
}

// Handle notification click - open the app
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
      if (list.length > 0) return list[0].focus();
      return clients.openWindow("/");
    })
  );
});

// Listen for heartbeat pings from the app
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "HEARTBEAT") {
    checkAndNotify();
  }
});
