export default function handler(req, res) {
  res.status(200).json({
    notifyTime: process.env.NOTIFY_TIME || "23:59"
  });
}
