const redis = require("../dbconn/redis");
const { nanoid } = require("nanoid");

const createPaste=async (req, res) => {
  try {
    console.log(req.body)
    const { content, ttl_seconds, max_views } = req.body;

    if (typeof content !== "string" || !content.trim()) {
      return res.status(400).json({
        error: "content is required and must be a non-empty string"
      });
    }

    if (
      ttl_seconds !== undefined &&
      (!Number.isInteger(ttl_seconds) || ttl_seconds < 1)
    ) {
      return res.status(400).json({
        error: "ttl_seconds must be an integer >= 1"
      });
    }

    if (
      max_views !== undefined &&
      (!Number.isInteger(max_views) || max_views < 1)
    ) {
      return res.status(400).json({
        error: "max_views must be an integer >= 1"
      });
    }

    const id = nanoid(10);
    const now = Date.now();

    const paste = {
      id,
      content,
      created_at: now,
      expires_at: ttl_seconds ? now + ttl_seconds * 1000 : null,
      max_views: max_views ?? null,
      views: 0
    };

    if (ttl_seconds) {
      await redis.set(
        `paste:${id}`,
        JSON.stringify(paste),
        "EX",
        ttl_seconds
      );
    } else {
      await redis.set(`paste:${id}`, JSON.stringify(paste));
    }

    // ---------- Response ----------
    return res.status(201).json({
      id,
      url: `${req.protocol}://${req.get("host")}/p/${id}`
    });
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: "internal server error" });
  }
}

module.exports={createPaste}