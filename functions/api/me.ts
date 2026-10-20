/// <reference types="@cloudflare/workers-types" />

import { readCookie, verifyJWT, SESSION_COOKIE } from "../lib/auth";

interface Env {
  AUTH_SECRET: string;
}

// GET /api/me —— 前端用它判断该显示登录框还是工作台
// 未登录返回 401 + { authenticated: false }，这是正常状态而非错误
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const token = readCookie(context.request, SESSION_COOKIE);
  if (!token) return Response.json({ authenticated: false }, { status: 401 });

  const payload = await verifyJWT(token, context.env.AUTH_SECRET || "");
  if (!payload) return Response.json({ authenticated: false }, { status: 401 });

  return Response.json({ authenticated: true, username: payload.sub });
};
