import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * ด่านรหัสผ่านของหน้าแอดมิน — ใช้ได้เฉพาะฝั่งเซิร์ฟเวอร์
 * รหัสผ่านอยู่ใน env ADMIN_PASSWORD (ไม่มี NEXT_PUBLIC_ จึงไม่หลุดไปฝั่งเบราว์เซอร์)
 * เปลี่ยนรหัสผ่านเมื่อไร ทุกเครื่องที่ล็อกอินค้างไว้จะหลุดทันที
 */

const ADMIN_COOKIE = "tgkb_admin";
const SESSION_DAYS = 30;

function sessionToken(): string | null {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;
  return createHmac("sha256", password).update("tgkb-admin-session").digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  // hash ก่อนเทียบ เพื่อให้ความยาวเท่ากันเสมอและเทียบแบบ constant-time ได้
  const x = createHash("sha256").update(a).digest();
  const y = createHash("sha256").update(b).digest();
  return timingSafeEqual(x, y);
}

export function isPasswordConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export function checkPassword(input: string): boolean {
  const password = process.env.ADMIN_PASSWORD;
  return Boolean(password) && safeEqual(input, password as string);
}

export async function isAdminAuthed(): Promise<boolean> {
  const expected = sessionToken();
  if (!expected) return false;
  const actual = (await cookies()).get(ADMIN_COOKIE)?.value;
  return Boolean(actual) && safeEqual(actual as string, expected);
}

export async function startAdminSession(): Promise<void> {
  const token = sessionToken();
  if (!token) return;
  (await cookies()).set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * SESSION_DAYS,
  });
}

export async function endAdminSession(): Promise<void> {
  (await cookies()).delete(ADMIN_COOKIE);
}
