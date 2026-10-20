/// <reference types="@cloudflare/workers-types" />

interface Env {
  DB: D1Database;
  AUTH_SECRET: string;
}

// 健康检查：同时报告 D1 绑定状态。
// 这是验证 Functions 管道是否打通的探针。
export const onRequestGet: PagesFunction<Env> = async (context) => {
  let db: string;
  try {
    if (!context.env.DB) {
      db = "not-bound";
    } else {
      await context.env.DB.prepare("SELECT 1").first();
      db = "ok";
    }
  } catch (err) {
    db = `error: ${(err as Error).message}`;
  }

  return Response.json({
    ok: true,
    db,
    authSecretSet: Boolean(context.env.AUTH_SECRET),
    time: new Date().toISOString(),
  });
};
