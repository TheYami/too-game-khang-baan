"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { dealsConfig } from "@/config/site";
import { fetchDeals } from "@/lib/cheapshark/client";
import type { Deal, DealsQuery } from "@/lib/cheapshark/types";

export type DealsStatus =
  | "loading" // โหลดครั้งแรก / เปลี่ยนเงื่อนไข ยังไม่มีอะไรให้โชว์
  | "refreshing" // มีข้อมูลโชว์อยู่ กำลังดึงใหม่เบื้องหลัง
  | "loadingMore"
  | "ready"
  | "error";

interface DealsState {
  deals: Deal[];
  status: DealsStatus;
  page: number;
  hasMore: boolean;
  updatedAt: number | null;
}

function mergeDeals(current: Deal[], incoming: Deal[]): Deal[] {
  const seen = new Set(current.map((deal) => deal.id));
  return [...current, ...incoming.filter((deal) => !seen.has(deal.id))];
}

/**
 * ดึงดีลตามเงื่อนไข + โหลดเพิ่ม + รีเฟรชอัตโนมัติ
 * initialDeals คือข้อมูลที่เซิร์ฟเวอร์ render มาให้ก่อน (ใช้ได้กับเงื่อนไขตั้งต้นเท่านั้น)
 */
export function useDeals(query: DealsQuery, initialDeals: Deal[] = []) {
  const queryKey = JSON.stringify(query);

  const [state, setState] = useState<DealsState>({
    deals: initialDeals,
    status: initialDeals.length > 0 ? "refreshing" : "loading",
    page: 0,
    hasMore: initialDeals.length >= dealsConfig.pageSize,
    updatedAt: null,
  });

  const abortRef = useRef<AbortController | null>(null);
  const lastKeyRef = useRef(queryKey);
  const pageRef = useRef(0);

  const load = useCallback(
    async (page: number, mode: "replace" | "append") => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setState((s) => ({
        ...s,
        status:
          mode === "append"
            ? "loadingMore"
            : s.deals.length > 0
              ? "refreshing"
              : "loading",
      }));

      try {
        const baseQuery = JSON.parse(queryKey) as DealsQuery;
        const incoming = await fetchDeals(
          { ...baseQuery, pageNumber: page },
          { signal: controller.signal },
        );
        if (controller.signal.aborted) return;
        pageRef.current = page;
        setState((s) => ({
          deals: mode === "append" ? mergeDeals(s.deals, incoming) : incoming,
          status: "ready",
          page,
          hasMore: incoming.length >= dealsConfig.pageSize,
          updatedAt: Date.now(),
        }));
      } catch {
        if (controller.signal.aborted) return;
        setState((s) => ({ ...s, status: "error" }));
      }
    },
    [queryKey],
  );

  // โหลดเมื่อเปิดหน้า และทุกครั้งที่เงื่อนไขเปลี่ยน
  useEffect(() => {
    if (lastKeyRef.current !== queryKey) {
      lastKeyRef.current = queryKey;
      pageRef.current = 0;
      setState((s) => ({ ...s, deals: [], page: 0, hasMore: false }));
    }
    void load(0, "replace");
    return () => abortRef.current?.abort();
  }, [queryKey, load]);

  // รีเฟรชอัตโนมัติ เฉพาะตอนแท็บเปิดอยู่และยังไม่ได้กดโหลดเพิ่ม
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === "visible" && pageRef.current === 0) {
        void load(0, "replace");
      }
    }, dealsConfig.autoRefreshMs);
    return () => clearInterval(timer);
  }, [load]);

  const refresh = useCallback(() => load(0, "replace"), [load]);
  const loadMore = useCallback(
    () => load(pageRef.current + 1, "append"),
    [load],
  );

  return { ...state, refresh, loadMore };
}
