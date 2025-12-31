const redis = require("../dbconn/redis");

const healthFunction=async (req, res) => {
  try {
    await redis.ping();
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false });
  }
}

module.exports={healthFunction}