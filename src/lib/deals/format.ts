import type { Deal } from "@/lib/cheapshark/types";

export function formatPrice(usd: number): string {
  return usd <= 0 ? "ฟรี" : `$${usd.toFixed(2)}`;
}

/** ปัดลงเสมอ เพื่อไม่ให้ป้ายส่วนลดโชว์เกินจริง (74.6% → 74%) */
export function formatSavings(savings: number): number {
  return Math.floor(savings);
}

/** รูปปกขนาดใหญ่จาก Steam — ถ้าโหลดไม่ได้ UI จะถอยไปใช้ deal.thumb */
export function getCoverUrl(deal: Deal): string {
  if (!deal.steamAppId) return deal.thumb;
  return `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${deal.steamAppId}/header.jpg`;
}
