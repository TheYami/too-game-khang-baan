import {
  dealsConfig,
  quickFilterThresholds as t,
  steamConfig,
} from "@/config/site";
import type { Deal, DealsQuery } from "@/lib/cheapshark/types";
import type { RegionalPrice, RegionalPriceMap } from "@/lib/steam/types";

/* ---------- ตัวกรองด่วน ---------- */

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

/* ---------- การเรียงลำดับ ---------- */

export type SortId = "recommended" | "savings" | "reviews" | "price";

export interface SortOption {
  id: SortId;
  label: string;
  /** ค่า sortBy ที่ส่งให้ CheapShark */
  apiSortBy: string;
}

export const SORT_OPTIONS: SortOption[] = [
  { id: "recommended", label: "ดีลคุ้มค่าแนะนำ", apiSortBy: "DealRating" },
  { id: "savings", label: "ลดเยอะสุด (%)", apiSortBy: "Savings" },
  { id: "reviews", label: "คะแนนรีวิวสูงสุด", apiSortBy: "Reviews" },
  { id: "price", label: "ราคาถูกสุด", apiSortBy: "Price" },
];

export const DEFAULT_SORT: SortId = dealsConfig.defaultSort;

/* ---------- แปลงเป็นเงื่อนไขของ API ---------- */

/**
 * แปลงคำค้น + ปุ่มกรอง + การเรียง เป็นเงื่อนไขที่ส่งให้ API
 * ส่งให้ API เฉพาะเงื่อนไขที่ไม่ขึ้นกับประเทศ (ชื่อเกม, คะแนนรีวิว, การเรียง)
 * ส่วนราคาและส่วนลดกรองฝั่งแอปด้วยตัวเลขของร้านไทย — ดู applyQuickFilters
 */
export function toDealsQuery(
  search: string,
  active: ReadonlySet<QuickFilterId>,
  sort: SortId = DEFAULT_SORT,
): DealsQuery {
  const option = SORT_OPTIONS.find((o) => o.id === sort) ?? SORT_OPTIONS[0];
  const query: DealsQuery = { sortBy: option.apiSortBy };

  const title = search.trim();
  if (title) query.title = title;

  // ค้นด้วยชื่อ = อยากเจอเกมนั้นจริง ๆ จึงไม่กรองคะแนนขั้นต่ำ (ยกเว้นกดปุ่มกรองเอง)
  const ratingFloor = Math.max(
    title ? 0 : dealsConfig.minSteamRating,
    active.has("goodRating") ? t.goodRatingPercent : 0,
  );
  if (ratingFloor > 0) query.steamRating = ratingFloor;

  return query;
}

/** เงื่อนไขตั้งต้นของหน้าแรก — เซิร์ฟเวอร์กับเบราว์เซอร์ใช้ตัวเดียวกัน */
export const DEFAULT_DEALS_QUERY: DealsQuery = toDealsQuery("", new Set());

/* ---------- กรอง/เรียงฝั่งแอปด้วยตัวเลขร้านไทย ---------- */

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

/** ราคาเป็นบาทสำหรับเทียบกัน (เกมที่ไม่มีราคาบาทใช้ค่าประมาณจาก USD) */
export function effectivePriceThb(deal: Deal, prices: RegionalPriceMap): number {
  return (
    regionalOf(deal, prices)?.sale ??
    deal.salePrice * steamConfig.approxThbPerUsd
  );
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

/**
 * จัดลำดับสุดท้ายก่อนโชว์
 * - แนะนำ / รีวิว: คงลำดับจาก API (ไม่ขึ้นกับประเทศ)
 * - ลดเยอะสุด / ราคาถูกสุด: เรียงซ้ำด้วยตัวเลขร้านไทย ให้ตรงกับที่โชว์บนการ์ด
 */
export function sortDeals(
  deals: Deal[],
  sort: SortId,
  prices: RegionalPriceMap = {},
): Deal[] {
  if (sort !== "savings" && sort !== "price") return deals;

  const keyOf = (deal: Deal) =>
    sort === "savings"
      ? -effectiveSavings(deal, prices)
      : effectivePriceThb(deal, prices);

  return deals
    .map((deal, index) => ({ deal, index, key: keyOf(deal) }))
    .sort((a, b) => a.key - b.key || a.index - b.index)
    .map((entry) => entry.deal);
}
