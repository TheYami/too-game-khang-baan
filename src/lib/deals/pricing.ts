import { steamConfig } from "@/config/site";
import type { Deal } from "@/lib/cheapshark/types";
import type { RegionalPrice } from "@/lib/steam/types";
import { formatPrice, formatSavings } from "./format";

/** ราคาที่พร้อมโชว์ — การ์ดและ Prompt ใช้ตัวเดียวกัน ตัวเลขจึงตรงกันเสมอ */
export interface DisplayPrice {
  sale: string;
  normal: string;
  /** เปอร์เซ็นต์ส่วนลดแบบจำนวนเต็ม (0 = ไม่ได้ลด) */
  savingsPercent: number;
  /** true = ราคาบาทจากร้าน Steam ไทย, false = ราคา USD จาก CheapShark */
  isRegional: boolean;
}

export function formatRegionalAmount(amount: number): string {
  if (amount <= 0) return "ฟรี";
  const digits = Number.isInteger(amount) ? 0 : 2;
  const text = amount.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
  return `${steamConfig.currencySymbol}${text}`;
}

/** มีราคาบาทก็ใช้ราคาบาท (คือราคาที่ลูกเพจจ่ายจริง) ไม่มีก็ถอยไปใช้ USD */
export function getDisplayPrice(
  deal: Deal,
  regional?: RegionalPrice,
): DisplayPrice {
  if (regional) {
    return {
      sale: formatRegionalAmount(regional.sale),
      normal: formatRegionalAmount(regional.normal),
      savingsPercent: regional.discountPercent,
      isRegional: true,
    };
  }
  return {
    sale: formatPrice(deal.salePrice),
    normal: formatPrice(deal.normalPrice),
    savingsPercent: formatSavings(deal.savings),
    isRegional: false,
  };
}
