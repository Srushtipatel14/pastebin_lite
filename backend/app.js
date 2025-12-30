require("dotenv").config();
const express = require("express");
const cors = require("cors")
const { nanoid } = require("nanoid");
const redis = require("./redis");
const path = require("path");
const fs = require("fs");

const { getNow } = require("./now");

const app = express();
app.use(express.json());
app.use(cors())

app.get("/api/healthz", async (req, res) => {
  try {
    await redis.ping();
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false });
  }
});


app.post("/api/pastes", async (req, res) => {
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
    return res.status(500).json({ error: "internal server error" });
  }
});

app.get("/api/pastes/:id", async (req, res) => {
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
});

app.get("/p/:id", async (req, res) => {
  const key = `paste:${req.params.id}`;
  const paste = await redis.get(key);

  const templatePath = path.join(__dirname, "views", "paste.html");
  let html = fs.readFileSync(templatePath, "utf-8");

  const now = getNow(req);

  if (!paste) {
    html = html.replace(
      "{{CONTENT}}",
      `<div class="error-text">Paste Not Found</div>`
    );
    res.status(404).setHeader("Content-Type", "text/html");
    return res.send(html);
  }

  if (paste.expires_at && now >= paste.expires_at) {
    await redis.del(key);
    html = html.replace(
      "{{CONTENT}}",
      `<div class="error-text">Paste Expired</div>`
    );
    res.status(404).setHeader("Content-Type", "text/html");
    return res.send(html);
  }

  if (paste.max_views !== null && paste.views >= paste.max_views) {
    await redis.del(key);
    html = html.replace(
      "{{CONTENT}}",
      `<div class="error-text">User Limit Exceed</div>`
    );
    res.status(404).setHeader("Content-Type", "text/html");
    return res.send(html);
  }

  const updatedPaste = {
    ...paste,
    views: paste.views + 1
  };

  await redis.set(key, updatedPaste);

  html = html.replace("{{CONTENT}}", escapeHtml(updatedPaste.content));

  res.setHeader("Content-Type", "text/html");
  // res.setHeader("cache-control","no-store")
  return res.send(html);
});


function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}


app.listen(process.env.PORT)