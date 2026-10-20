// 共享安全工具：PBKDF2 密码哈希 + JWT 签发校验
// 只用 Web Crypto API（Workers 原生支持），零第三方依赖。
//
// 设计约定：
// - 密码永不存明文，只存 PBKDF2-SHA256(100k 迭代) 的哈希 + 随机盐
// - 会话用 HS256 JWT，放在 HttpOnly Cookie 里，前端 JS 读不到
// - 所有 base64 走 Uint8Array，避免 btoa 遇非 Latin1 字符（中文用户名）抛错

const encoder = new TextEncoder();

const PBKDF2_ITERATIONS = 100000;

// ── base64url ────────────────────────────────────────
function bytesToB64url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function strToB64url(str: string): string {
  return bytesToB64url(encoder.encode(str));
}

function b64urlToBytes(b64url: string): Uint8Array {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

// ── 密码哈希 ──────────────────────────────────────────
export async function hashPassword(
  password: string,
  salt: Uint8Array
): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt as BufferSource, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    key,
    256
  );
  return new Uint8Array(bits);
}

export function randomSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(16));
}

// ── 十六进制与字节互转（存 D1 用）────────────────────
export function bytesToHex(bytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < bytes.length; i++) out += bytes[i].toString(16).padStart(2, "0");
  return out;
}

export function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
  return out;
}

// ── 恒定时间比较（防时序侧信道）──────────────────────
export function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

// ── JWT ──────────────────────────────────────────────
export interface JWTPayload {
  sub: string;
  exp: number;
}

export async function signJWT(payload: JWTPayload, secret: string): Promise<string> {
  const header = strToB64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = strToB64url(JSON.stringify(payload));
  const data = `${header}.${body}`;
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return `${data}.${bytesToB64url(new Uint8Array(sig))}`;
}

export async function verifyJWT(
  token: string,
  secret: string
): Promise<JWTPayload | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, body, sig] = parts;

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  const sigBytes = b64urlToBytes(sig);
  const ok = await crypto.subtle.verify("HMAC", key, sigBytes as BufferSource, encoder.encode(`${header}.${body}`));
  if (!ok) return null;

  try {
    const payload = JSON.parse(new TextDecoder().decode(b64urlToBytes(body))) as JWTPayload;
    if (typeof payload.exp !== "number" || payload.exp * 1000 < Date.now()) return null;
    if (typeof payload.sub !== "string") return null;
    return payload;
  } catch {
    return null;
  }
}

// ── Cookie 读取 ──────────────────────────────────────
export function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get("Cookie") || "";
  const match = header.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

// ── 会话 Cookie 属性 ─────────────────────────────────
export const SESSION_COOKIE = "session";
export const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 天

export function sessionCookie(token: string, maxAge = SESSION_MAX_AGE): string {
  return [
    `${SESSION_COOKIE}=${encodeURIComponent(token)}`,
    "HttpOnly", // 前端 JS 读不到，防 XSS 窃取
    "Secure", // 仅 HTTPS 传输
    "SameSite=Lax", // 防 CSRF
    "Path=/",
    `Max-Age=${maxAge}`,
  ].join("; ");
}

export function clearSessionCookie(): string {
  return `${SESSION_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}
