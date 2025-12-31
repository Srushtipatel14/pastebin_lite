const redis = require("../dbconn/redis");
const path = require("path");
const fs = require("fs");
const { getNow } = require("../utils/checkHeader");

const getLink = async (req, res) => {
  const key = `paste:${req.params.id}`;
  const paste = await redis.get(key);

  const templatePath = path.join(__dirname, "..", "views", "paste.html");

  let html = fs.readFileSync(templatePath, "utf-8");
  const now = getNow(req);

  if (!paste) {
    html = html.replace(
      "{{CONTENT}}",
      `<div class="error-text">Paste Not Found</div>`
    );
    return res.status(404).type("html").send(html);
  }

  if (paste.expires_at && now >= paste.expires_at) {
    await redis.del(key);
    html = html.replace(
      "{{CONTENT}}",
      `<div class="error-text">Paste Expired</div>`
    );
    return res.status(404).type("html").send(html);
  }

  if (paste.max_views !== null && paste.views >= paste.max_views) {
    await redis.del(key);
    html = html.replace(
      "{{CONTENT}}",
      `<div class="error-text">View Limit Exceeded</div>`
    );
    return res.status(404).type("html").send(html);
  }

  const updatedPaste = {
    ...paste,
    views: paste.views + 1
  };

  await redis.set(key, updatedPaste);

  html = html.replace("{{CONTENT}}", escapeHtml(updatedPaste.content));

  res.setHeader("Cache-Control", "no-store");
  return res.type("html").send(html);
};

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

module.exports = { getLink };
