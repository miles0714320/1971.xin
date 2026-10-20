/// <reference types="@cloudflare/workers-types" />

import {
  hashPassword,
  hexToBytes,
  randomSalt,
  bytesToHex,
  timingSafeEqual,
  signJWT,
  sessionCookie,
  SESSION_MAX_AGE,
} from "../lib/auth";

interface Env {
  DB: D1Database;
  AUTH_SECRET: string;
}

interface UserRow {
  username: string;
  password_hash: string;
  salt: string;
}

// POST /api/login  { username, password }
// 成功 → 签发 HttpOnly Cookie；失败 → 统一 401（不区分"用户不存在"和"密码错误"）
export const onRequestPost: PagesFunction<Env> = async (context) => {
  if (!context.env.DB) return json({ error: "db not bound" }, 500);
  if (!context.env.AUTH_SECRET) return json({ error: "auth secret not set" }, 500);

  let body: { username?: unknown; password?: unknown };
  try {
    body = await context.request.json();
  } catch {
    return json({ error: "bad request" }, 400);
  }

  const username = typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!username || !password) return json({ error: "missing credentials" }, 400);
  if (username.length > 64 || password.length > 256) {
    return json({ error: "invalid credentials" }, 401);
  }

  const row = await context.env.DB
    .prepare("SELECT username, password_hash, salt FROM users WHERE username = ?")
    .bind(username)
    .first<UserRow>();

  // 无论用户是否存在都算一次哈希，耗时一致，避免通过响应时间探测用户名
  const salt = row ? hexToBytes(row.salt) : randomSalt();
  const computed = await hashPassword(password, salt);
  const stored = row ? hexToBytes(row.password_hash) : new Uint8Array(32);

  const ok = row !== null && timingSafeEqual(computed, stored);
  if (!ok) return json({ error: "invalid credentials" }, 401);

  const token = await signJWT(
    { sub: row.username, exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE },
    context.env.AUTH_SECRET
  );

  return new Response(JSON.stringify({ ok: true, username: row.username }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": sessionCookie(token),
    },
  });
};

function json(data: unknown, status = 200): Response {
  return Response.json(data, { status });
}
