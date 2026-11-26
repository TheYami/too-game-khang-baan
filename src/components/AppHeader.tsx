import Link from "next/link";
import type { ReactNode } from "react";
import { siteConfig } from "@/config/site";

interface AppHeaderProps {
  subtitle: string;
  /** ปุ่ม/ป้ายด้านขวา */
  action?: ReactNode;
  /** แถบค้นหา/ตัวกรองที่ติดอยู่ใต้หัว */
  children?: ReactNode;
  /** true = โชว์แถบวิ่งบาง ๆ ใต้หัว (กำลังดึงข้อมูล) */
  busy?: boolean;
}

export function AppHeader({ subtitle, action, children, busy }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-cabinet-700 bg-cabinet-900/95 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="mx-auto max-w-5xl px-4">
        <div className="flex h-16 items-center gap-3">
          {/* โลโก้ + ชื่อ กดกลับหน้าแรกได้ (ใช้แทนแถบเมนูล่าง) */}
          <Link href="/" className="flex min-w-0 flex-1 items-center gap-3">
            <div
              aria-hidden
              className="grid size-10 shrink-0 place-items-center rounded-xl border-2 border-gold-400 bg-ember-500 font-pixel text-sm text-cabinet-950 shadow-[0_3px_0_0_var(--color-ember-600)]"
            >
              TG
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-lg leading-tight font-bold text-cream">
                {siteConfig.name}
              </h1>
              <p className="truncate text-xs text-gold-400">{subtitle}</p>
            </div>
          </Link>
          {action}
        </div>
        {children && <div className="space-y-3 pb-3">{children}</div>}
      </div>
      {busy && (
        <div
          aria-hidden
          className="absolute inset-x-0 -bottom-px h-0.5 overflow-hidden"
        >
          <div className="refresh-slide h-full w-2/5 bg-gradient-to-r from-transparent via-gold-400 to-ember-500" />
        </div>
      )}
    </header>
  );
}
