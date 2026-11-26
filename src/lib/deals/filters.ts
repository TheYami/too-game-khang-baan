import { quickFilterThresholds as t, steamConfig } from "@/config/site";
import type { Deal, DealsQuery } from "@/lib/cheapshark/types";
import type { RegionalPrice, RegionalPriceMap } from "@/lib/steam/types";

export type QuickFilterId = "bigDiscount" | "goodRating" | "cheap";

export interface QuickFilter {
  id: QuickFilterId;
  label: string;
}

export const QUICK_FILTERS: QuickFilter[] = [
  { id: "bigDiscount", label: `ลดโหด ${t.bigDiscountPercent}%+` },
  { id: "goodRating", label: `คะแนนรีวิวดี ${t.goodRatingPercent}%+` },
  {
    id: "cheap",
    label: `ราคาไม่เกิน ${steamConfig.currencySymbol}${t.cheapPriceThb}`,
  },
];

/**
 * แปลงคำค้น + ปุ่มกรองเป็นเงื่อนไขที่ส่งให้ API
 * ส่งให้ API เฉพาะเงื่อนไขที่ไม่ขึ้นกับประเทศ (ชื่อเกม, คะแนนรีวิว)
 * ส่วนราคาและส่วนลดกรองฝั่งแอปด้วยตัวเลขของร้านไทย — ดู applyQuickFilters
 */
export function toDealsQuery(
  search: string,
  active: ReadonlySet<QuickFilterId>,
): DealsQuery {
  const query: DealsQuery = {};
  if (search.trim()) query.title = search.trim();
  if (active.has("goodRating")) query.steamRating = t.goodRatingPercent;
  return query;
}

function regionalOf(
  deal: Deal,
  prices: RegionalPriceMap,
): RegionalPrice | undefined {
  return deal.steamAppId ? prices[deal.steamAppId] : undefined;
}

/** ส่วนลดที่ใช้ตัดสิน: ของร้านไทยถ้ามี ไม่มีก็ใช้ของ CheapShark (โซนสหรัฐ) */
function effectiveSavings(deal: Deal, prices: RegionalPriceMap): number {
  return regionalOf(deal, prices)?.discountPercent ?? deal.savings;
}

function isCheap(deal: Deal, prices: RegionalPriceMap): boolean {
  const regional = regionalOf(deal, prices);
  return regional
    ? regional.sale <= t.cheapPriceThb
    : deal.salePrice <= t.cheapPriceUsd;
}

/** กรองด้วยราคา/ส่วนลดของร้านไทย เกมที่ไม่มีราคาบาทจะถอยไปใช้ตัวเลข USD */
export function applyQuickFilters(
  deals: Deal[],
  active: ReadonlySet<QuickFilterId>,
  prices: RegionalPriceMap = {},
): Deal[] {
  if (active.size === 0) return deals;
  return deals.filter((deal) => {
    if (
      active.has("bigDiscount") &&
      effectiveSavings(deal, prices) < t.bigDiscountPercent
    ) {
      return false;
    }
    if (
      active.has("goodRating") &&
      (deal.steamRatingPercent ?? 0) < t.goodRatingPercent
    ) {
      return false;
    }
    if (active.has("cheap") && !isCheap(deal, prices)) return false;
    return true;
  });
}

/** เรียงจากลดมากไปน้อยตามส่วนลดของร้านไทย (เท่ากัน = คงลำดับเดิมจาก API) */
export function sortBySavings(deals: Deal[], prices: RegionalPriceMap = {}): Deal[] {
  return deals
    .map((deal, index) => ({ deal, index, savings: effectiveSavings(deal, prices) }))
    .sort((a, b) => b.savings - a.savings || a.index - b.index)
    .map((entry) => entry.deal);
}
