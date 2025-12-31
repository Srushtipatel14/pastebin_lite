const redis = require("../dbconn/redis");
const  {getNow}=require("../utils/checkHeader")

const getPaste=async (req, res) => {
  const key = `paste:${req.params.id}`;

  const paste = await redis.get(key); // already an object

  if (!paste) {
    return res.status(404).json({ error: "not found" });
  }

  const now = getNow(req);

  if (paste.expires_at !== null && now >= paste.expires_at) {
    await redis.del(key);
    return res.status(404).json({ error: "expired" });
  }

  if (paste.max_views !== null && paste.views >= paste.max_views) {
    await redis.del(key);
    return res.status(404).json({ error: "view limit exceeded" });
  }

  const updatedPaste = {
    ...paste
  };

  await redis.set(key, updatedPaste); // no stringify needed

  const remainingViews =
    updatedPaste.max_views === null
      ? null
      : Math.max(updatedPaste.max_views - updatedPaste.views, 0);

  return res.json({
    content: updatedPaste.content,
    remaining_views: remainingViews,
    expires_at: updatedPaste.expires_at
      ? new Date(updatedPaste.expires_at).toISOString()
      : null
  });
}

module.exports={getPaste}