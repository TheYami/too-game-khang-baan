"use server";

import { revalidatePath } from "next/cache";
import {
  checkPassword,
  endAdminSession,
  isPasswordConfigured,
  startAdminSession,
} from "@/lib/auth/adminSession";

export interface LoginState {
  error: string | null;
}

export async function loginAction(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  if (!isPasswordConfigured()) {
    return { error: "ยังไม่ได้ตั้งรหัสผ่านแอดมินบนเซิร์ฟเวอร์" };
  }

  const password = String(formData.get("password") ?? "");
  if (!checkPassword(password)) {
    // หน่วงเล็กน้อยเพื่อให้การเดารหัสรัว ๆ ช้าลง
    await new Promise((resolve) => setTimeout(resolve, 800));
    return { error: "รหัสผ่านไม่ถูกต้อง" };
  }

  await startAdminSession();
  revalidatePath("/admin");
  return { error: null };
}

export async function logoutAction(): Promise<void> {
  await endAdminSession();
  revalidatePath("/admin");
}
