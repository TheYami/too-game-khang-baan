import { dealsConfig } from "@/config/site";
import type { CheapSharkDealRaw, Deal, DealsQuery } from "./types";

/**
 * ชั้นเรียก CheapShark API — ไม่มีโค้ด React/Next อยู่ในไฟล์นี้
 * จึงยกไปใช้ใน React Native / Capacitor ได้ทั้งไฟล์
 */

export function buildDealsUrl(query: DealsQuery = {}): string {
  const params = new URLSearchParams({
    storeID: dealsConfig.storeID,
    upperPrice: String(query.upperPrice ?? dealsConfig.upperPrice),
    sortBy: dealsConfig.sortBy,
    pageSize: String(dealsConfig.pageSize),
  });
  if (query.title?.trim()) params.set("title", query.title.trim());
  if (query.steamRating) params.set("steamRating", String(query.steamRating));
  if (query.pageNumber) params.set("pageNumber", String(query.pageNumber));
  return `${dealsConfig.apiBaseUrl}/deals?${params.toString()}`;
}

function toNumber(value: string | null | undefined): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function toDeal(raw: CheapSharkDealRaw): Deal {
  const rating = toNumber(raw.steamRatingPercent);
  const metacritic = toNumber(raw.metacriticScore);
  return {
    id: raw.dealID,
    gameId: raw.gameID,
    steamAppId: raw.steamAppID || null,
    title: raw.title,
    thumb: raw.thumb,
    normalPrice: toNumber(raw.normalPrice),
    salePrice: toNumber(raw.salePrice),
    savings: toNumber(raw.savings),
    steamRatingPercent: rating > 0 ? rating : null,
    steamRatingText: raw.steamRatingText || null,
    steamRatingCount: toNumber(raw.steamRatingCount),
    metacriticScore: metacritic > 0 ? metacritic : null,
  };
}

export async function fetchDeals(
  query: DealsQuery = {},
  init: RequestInit = {},
): Promise<Deal[]> {
  const headers = new Headers(init.headers);
  // เบราว์เซอร์ส่ง User-Agent ของตัวเองอยู่แล้ว (และไม่ยอมให้แก้) — ตั้งเฉพาะตอนรันบนเซิร์ฟเวอร์
  if (typeof window === "undefined") {
    headers.set("User-Agent", dealsConfig.userAgent);
  }

  const response = await fetch(buildDealsUrl(query), { ...init, headers });
  if (!response.ok) {
    throw new Error(`CheapShark ตอบกลับ ${response.status}`);
  }
  const data: unknown = await response.json();
  if (!Array.isArray(data)) return [];
  return (data as CheapSharkDealRaw[]).map(toDeal);
}
