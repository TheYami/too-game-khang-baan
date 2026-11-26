"use client";

import { useEffect, useRef, useState } from "react";
import type { Deal } from "@/lib/cheapshark/types";
import type { RegionalPriceMap } from "@/lib/steam/types";

/**
 * เติมราคาบาทให้ดีลที่โชว์อยู่ โดยถามผ่าน /api/steam-prices ของเราเอง
 * ถามเฉพาะเกมที่ยังไม่เคยถาม และล้มเงียบ (การ์ดจะโชว์ราคา USD ต่อไป)
 */
export function useRegionalPrices(
  deals: Deal[],
  initialPrices: RegionalPriceMap = {},
): RegionalPriceMap {
  const [prices, setPrices] = useState<RegionalPriceMap>(initialPrices);
  const requestedRef = useRef<Set<string>>(new Set(Object.keys(initialPrices)));

  useEffect(() => {
    const missing = deals
      .map((deal) => deal.steamAppId)
      .filter((id): id is string => Boolean(id) && !requestedRef.current.has(id as string));
    const ids = [...new Set(missing)].sort();
    if (ids.length === 0) return;

    ids.forEach((id) => requestedRef.current.add(id));
    let cancelled = false;

    fetch(`/api/steam-prices?ids=${ids.join(",")}`)
      .then((response) => (response.ok ? response.json() : {}))
      .then((incoming: RegionalPriceMap) => {
        if (!cancelled) setPrices((current) => ({ ...current, ...incoming }));
      })
      .catch(() => {
        // ปล่อยให้ลองใหม่ได้ในรอบถัดไป
        ids.forEach((id) => requestedRef.current.delete(id));
      });

    return () => {
      cancelled = true;
    };
  }, [deals]);

  return prices;
}
