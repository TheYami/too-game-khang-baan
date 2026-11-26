import { steamConfig } from "@/config/site";
import type { RegionalPriceMap } from "./types";

/**
 * ดึงราคาหน้าร้าน Steam ตามประเทศ — ต้องเรียกจากฝั่งเซิร์ฟเวอร์เท่านั้น
 * (endpoint นี้ไม่เปิด CORS และเป็น endpoint ของหน้าร้านที่ Steam ไม่มีเอกสารทางการ
 *  จึงออกแบบให้ล้มเงียบ: ดึงไม่ได้ = คืน {} แล้ว UI ถอยไปโชว์ราคา USD)
 */

interface SteamAppDetailsEntry {
  success: boolean;
  // เกมฟรี/ไม่ขายในโซนนี้ Steam จะตอบ data เป็น [] แทน object
  data?:
    | {
        price_overview?: {
          currency: string;
          initial: number;
          final: number;
          discount_percent: number;
        };
      }
    | unknown[];
}

/** รับเฉพาะเลข app id ล้วน ตัดซ้ำ และจำกัดจำนวนต่อคำขอ */
export function sanitizeAppIds(ids: readonly string[]): string[] {
  const clean = ids.map((id) => id.trim()).filter((id) => /^\d{1,10}$/.test(id));
  return [...new Set(clean)].sort().slice(0, steamConfig.maxAppsPerRequest);
}

export async function fetchRegionalPrices(
  appIds: readonly string[],
  init: RequestInit = {},
): Promise<RegionalPriceMap> {
  const ids = sanitizeAppIds(appIds);
  if (ids.length === 0) return {};

  const params = new URLSearchParams({
    appids: ids.join(","),
    cc: steamConfig.countryCode,
    // ขอหลายเกมในคำขอเดียวได้เฉพาะเมื่อกรองเหลือ price_overview
    filters: "price_overview",
  });

  try {
    const response = await fetch(
      `https://store.steampowered.com/api/appdetails?${params.toString()}`,
      init,
    );
    if (!response.ok) return {};

    const body = (await response.json()) as Record<string, SteamAppDetailsEntry> | null;
    if (!body || typeof body !== "object") return {};

    const prices: RegionalPriceMap = {};
    for (const id of ids) {
      const entry = body[id];
      if (!entry?.success || !entry.data || Array.isArray(entry.data)) continue;
      const overview = entry.data.price_overview;
      if (!overview) continue;
      prices[id] = {
        currency: overview.currency,
        normal: overview.initial / 100,
        sale: overview.final / 100,
        discountPercent: overview.discount_percent,
      };
    }
    return prices;
  } catch {
    return {};
  }
}
