import { steamConfig } from "@/config/site";
import type { RegionalPriceMap } from "./types";

/**
 * ขอราคาบาทผ่าน /api/steam-prices ของเราเอง (ใช้ฝั่งเบราว์เซอร์)
 * แบ่งคำขอเป็นชุดตามเพดานของ API และล้มเงียบ: ชุดไหนดึงไม่ได้ก็ข้ามชุดนั้นไป
 */
export async function requestRegionalPrices(
  appIds: readonly string[],
  signal?: AbortSignal,
): Promise<RegionalPriceMap> {
  const ids = [...new Set(appIds)].sort();
  const chunks: string[][] = [];
  for (let i = 0; i < ids.length; i += steamConfig.maxAppsPerRequest) {
    chunks.push(ids.slice(i, i + steamConfig.maxAppsPerRequest));
  }

  const results = await Promise.all(
    chunks.map(async (chunk): Promise<RegionalPriceMap> => {
      try {
        const response = await fetch(`/api/steam-prices?ids=${chunk.join(",")}`, {
          signal,
        });
        return response.ok ? ((await response.json()) as RegionalPriceMap) : {};
      } catch {
        return {};
      }
    }),
  );

  return Object.assign({}, ...results) as RegionalPriceMap;
}
