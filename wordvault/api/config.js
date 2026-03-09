export default function handler(req, res) {
  res.status(200).json({
    notifyTime: process.env.NOTIFY_TIME || "22:00"
  });
}
