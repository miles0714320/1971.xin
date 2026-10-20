-- 1971.xin 工作台 · 数据库结构
-- 用 wrangler d1 execute 或 Cloudflare 后台 D1 Console 执行，可重复执行（幂等）。

CREATE TABLE IF NOT EXISTS users (
  username      TEXT PRIMARY KEY,
  password_hash TEXT NOT NULL,          -- PBKDF2-SHA256(100k) 十六进制，永不存明文
  salt          TEXT NOT NULL,          -- 16 字节随机盐，十六进制
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
