/// <reference types="@cloudflare/workers-types" />

import {
  hashPassword,
  randomSalt,
  bytesToHex,
} from "../lib/auth";

interface Env {
  DB: D1Database;
}

// POST /api/setup  { username, password }
// 一次性初始化：仅在 users 表为空时允许创建第一个账号。
// 一旦有了用户，此端点永久返回 409 —— 防止它成为后门。
// 这样初始化全程在浏览器完成，密码不必经过任何第三方（包括我）。
export const onRequestPost: PagesFunction<Env> = async (context) => {
  if (!context.env.DB) return json({ error: "db not bound" }, 500);

  let body: { username?: unknown; password?: unknown };
  try {
    body = await context.request.json();
  } catch {
    return json({ error: "bad request" }, 400);
  }

  const username = typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!username || username.length < 2 || username.length > 32) {
    return json({ error: "username must be 2-32 chars" }, 400);
  }
  if (password.length < 8 || password.length > 128) {
    return json({ error: "password must be at least 8 chars" }, 400);
  }

  // 表里已有任何用户就拒绝：保证只能用一次
  const existing = await context.env.DB
    .prepare("SELECT COUNT(*) AS c FROM users")
    .first<{ c: number }>();
  if (existing && existing.c > 0) {
    return json({ error: "already initialized" }, 409);
  }

  const salt = randomSalt();
  const hash = await hashPassword(password, salt);

  try {
    await context.env.DB
      .prepare(
        "INSERT INTO users (username, password_hash, salt) VALUES (?, ?, ?)"
      )
      .bind(username, bytesToHex(hash), bytesToHex(salt))
      .run();
  } catch (err) {
    // 并发初始化时可能撞主键，按"已初始化"处理
    return json({ error: `init failed: ${(err as Error).message}` }, 409);
  }

  return json({ ok: true, username });
};

function json(data: unknown, status = 200): Response {
  return Response.json(data, { status });
}
