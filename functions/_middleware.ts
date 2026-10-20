/// <reference types="@cloudflare/workers-types" />

interface Env {
  DB: D1Database;
  AUTH_SECRET: string;
}

// 全局鉴权中间件：保护 /api/*，未登录一律 401
// 放行清单：登录、登出、健康检查、首次初始化（它们自己判断状态）
const PUBLIC_ROUTES = ["/api/health", "/api/login", "/api/logout", "/api/me", "/api/setup"];

export const onRequest: PagesFunction<Env> = async (context) => {
  const { pathname } = new URL(context.request.url);

  // 只拦 API，静态页面（含登录页本身）必须能公开访问
  if (!pathname.startsWith("/api/")) return context.next();
  if (PUBLIC_ROUTES.includes(pathname)) return context.next();

  const token = readSession(context.request);
  if (!token) return jsonError("unauthorized", 401);

  const { verifyJWT } = await import("../lib/auth");
  const payload = await verifyJWT(token, context.env.AUTH_SECRET || "");
  if (!payload) return jsonError("unauthorized", 401);

  context.data.user = payload;
  return context.next();
};

function readSession(request: Request): string | null {
  const header = request.headers.get("Cookie") || "";
  const match = header.match(/(?:^|;\s*)session=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function jsonError(error: string, status: number): Response {
  return Response.json({ error }, { status });
}
