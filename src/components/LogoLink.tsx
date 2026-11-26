"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef, type MouseEvent, type ReactNode } from "react";

const SECRET_TAPS = 5;
const TAP_WINDOW_MS = 3000;

/**
 * โลโก้ + ชื่อบนหัว กดแล้วกลับหน้าแรก
 * ทางลัดของแอดมิน: อยู่หน้าแรกแล้วกดโลโก้ติดกัน 5 ครั้งใน 3 วินาที = ไปหน้า /admin
 * (หน้า /admin ยังถามรหัสผ่านตามปกติ ทางลัดนี้แค่ไม่ต้องพิมพ์ path เอง)
 */
export function LogoLink({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const taps = useRef<number[]>([]);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (pathname !== "/") return; // อยู่หน้าอื่น = ลิงก์กลับหน้าแรกตามปกติ

    event.preventDefault();
    const now = Date.now();
    taps.current = [...taps.current, now].filter((t) => now - t <= TAP_WINDOW_MS);
    if (taps.current.length >= SECRET_TAPS) {
      taps.current = [];
      router.push("/admin");
    }
  };

  return (
    <Link
      href="/"
      onClick={handleClick}
      className="flex min-w-0 flex-1 items-center gap-3"
    >
      {children}
    </Link>
  );
}
