"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gachaConfig, steamConfig } from "@/config/site";
import { fetchDeals } from "@/lib/cheapshark/client";
import type { Deal } from "@/lib/cheapshark/types";
import { effectivePriceThb } from "@/lib/deals/filters";
import { requestRegionalPrices } from "@/lib/steam/clientPrices";
import type { RegionalPrice, RegionalPriceMap } from "@/lib/steam/types";

export type GachaStatus = "idle" | "loading" | "rolling" | "result" | "empty";

interface Pool {
  deals: Deal[];
  prices: RegionalPriceMap;
}

const EMPTY_POOL: Pool = { deals: [], prices: {} };

function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/** ดึงกองเกมรีวิวดีมาเตรียมสุ่ม — budgetThb 0 = ไม่จำกัดงบ */
async function loadPool(budgetThb: number): Promise<Pool> {
  // ราคาไทยมักถูกกว่าแปลงจาก USD ตรง ๆ จึงเผื่อเพดาน USD ไว้กว้างกว่างบ แล้วค่อยกรองด้วยราคาบาทจริง
  const upperPrice =
    budgetThb > 0
      ? Math.min(
          gachaConfig.upperPriceUsd,
          Math.ceil((budgetThb / steamConfig.approxThbPerUsd) * 2.5),
        )
      : gachaConfig.upperPriceUsd;

  const deals = await fetchDeals({
    sortBy: "DealRating",
    steamRating: gachaConfig.minSteamRating,
    pageSize: gachaConfig.poolSize,
    upperPrice,
  });

  const appIds = deals
    .map((deal) => deal.steamAppId)
    .filter((id): id is string => Boolean(id));
  const prices = await requestRegionalPrices(appIds);

  const inBudget =
    budgetThb > 0
      ? deals.filter((deal) => effectivePriceThb(deal, prices) <= budgetThb)
      : deals;

  return { deals: inBudget, prices };
}

/**
 * สุ่มเกมรีวิวดี 1 เกมตามงบ
 * - กองเกมของแต่ละงบดึงครั้งเดียวแล้วจำไว้ กด "สุ่มใหม่" จึงไม่ต้องรอโหลด
 * - ไม่ออกเกมซ้ำจนกว่าจะวนครบทั้งกอง
 */
export function useGacha() {
  const [status, setStatus] = useState<GachaStatus>("idle");
  const [deal, setDeal] = useState<Deal | null>(null);
  const [reelTitle, setReelTitle] = useState("");
  const [prices, setPrices] = useState<RegionalPriceMap>({});

  const pools = useRef(new Map<number, Promise<Pool>>());
  const seen = useRef(new Map<number, Set<string>>());
  const interval = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const runId = useRef(0);

  /** หยุดการสุ่มที่ค้างอยู่ (ใช้ตอนปิดหน้าต่างหรือกดสุ่มซ้อน) */
  const stop = useCallback(() => {
    runId.current += 1;
    if (interval.current) clearInterval(interval.current);
    if (timeout.current) clearTimeout(timeout.current);
    interval.current = null;
    timeout.current = null;
  }, []);

  const roll = useCallback(
    async (budgetThb: number) => {
      stop();
      const id = runId.current;
      setStatus("loading");

      let poolPromise = pools.current.get(budgetThb);
      if (!poolPromise) {
        poolPromise = loadPool(budgetThb).catch(() => {
          pools.current.delete(budgetThb); // ล้มเหลว = ให้ลองดึงใหม่ได้รอบหน้า
          return EMPTY_POOL;
        });
        pools.current.set(budgetThb, poolPromise);
      }
      const pool = await poolPromise;
      if (id !== runId.current) return;

      if (pool.deals.length === 0) {
        setDeal(null);
        setStatus("empty");
        return;
      }
      setPrices(pool.prices);

      const seenIds = seen.current.get(budgetThb) ?? new Set<string>();
      seen.current.set(budgetThb, seenIds);
      let candidates = pool.deals.filter((d) => !seenIds.has(d.id));
      if (candidates.length === 0) {
        seenIds.clear();
        candidates = pool.deals;
      }
      const picked = pickRandom(candidates);
      seenIds.add(picked.id);

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduceMotion) {
        setDeal(picked);
        setStatus("result");
        return;
      }

      // วงล้อ: ชื่อเกมวิ่งผ่านเร็ว ๆ ก่อนเฉลย
      setReelTitle(pickRandom(pool.deals).title);
      setStatus("rolling");
      interval.current = setInterval(() => {
        setReelTitle(pickRandom(pool.deals).title);
      }, 90);
      timeout.current = setTimeout(() => {
        if (interval.current) clearInterval(interval.current);
        interval.current = null;
        if (id !== runId.current) return;
        setDeal(picked);
        setStatus("result");
      }, gachaConfig.rollMs);
    },
    [stop],
  );

  useEffect(() => stop, [stop]);

  const regionalPrice: RegionalPrice | undefined =
    deal?.steamAppId ? prices[deal.steamAppId] : undefined;

  return { status, deal, reelTitle, regionalPrice, roll, stop };
}
