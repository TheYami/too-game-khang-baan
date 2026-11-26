"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import { dealsConfig } from "@/config/site";
import { useDeals } from "@/hooks/useDeals";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useRegionalPrices } from "@/hooks/useRegionalPrices";
import type { RegionalPriceMap } from "@/lib/steam/types";
import type { Deal } from "@/lib/cheapshark/types";
import { copyText } from "@/lib/clipboard";
import {
  applyQuickFilters,
  sortBySavings,
  toDealsQuery,
  type QuickFilterId,
} from "@/lib/deals/filters";
import {
  buildFacebookPostPrompt,
  buildRoundupPostPrompt,
} from "@/lib/prompt/facebookPost";
import { AppHeader } from "./AppHeader";
import { ArcadeLoader } from "./ArcadeLoader";
import { DealCard } from "./DealCard";
import { QuickFilters } from "./QuickFilters";
import { SearchBar } from "./SearchBar";
import { useToast } from "./ToastProvider";

interface DealsScreenProps {
  mode: "public" | "admin";
  /** ดีลชุดตั้งต้นที่เซิร์ฟเวอร์ดึงมาให้ */
  initialDeals?: Deal[];
  /** ปุ่มเสริมบนหัว วางก่อนปุ่มรีเฟรช (เช่น ออกจากระบบ) */
  headerAction?: ReactNode;
  /** ราคาบาทของดีลชุดตั้งต้น ที่เซิร์ฟเวอร์ดึงมาให้พร้อมกัน */
  initialPrices?: RegionalPriceMap;
}

const timeFormatter = new Intl.DateTimeFormat("th-TH", {
  hour: "2-digit",
  minute: "2-digit",
});

export function DealsScreen({
  mode,
  initialDeals = [],
  headerAction,
  initialPrices,
}: DealsScreenProps) {
  const isAdmin = mode === "admin";
  const toast = useToast();

  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<Set<QuickFilterId>>(
    () => new Set(),
  );
  const debouncedSearch = useDebouncedValue(search);

  const query = useMemo(
    () => toDealsQuery(debouncedSearch, activeFilters),
    [debouncedSearch, activeFilters],
  );
  const isDefaultQuery = Object.keys(query).length === 0;

  const { deals, status, hasMore, updatedAt, refresh, loadMore } = useDeals(
    query,
    isDefaultQuery ? initialDeals : [],
  );

  const regionalPrices = useRegionalPrices(deals, initialPrices);

  // กรองและเรียงด้วยราคา/ส่วนลดของร้านไทย ให้ตรงกับตัวเลขที่โชว์บนการ์ด
  const visibleDeals = useMemo(
    () =>
      sortBySavings(
        applyQuickFilters(deals, activeFilters, regionalPrices),
        regionalPrices,
      ),
    [deals, activeFilters, regionalPrices],
  );

  const toggleFilter = useCallback((id: QuickFilterId) => {
    setActiveFilters((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const copyPrompt = useCallback(
    async (text: string, successMessage: string) => {
      const ok = await copyText(text);
      if (ok) toast.show(successMessage);
      else toast.show("คัดลอกไม่สำเร็จ ลองอีกครั้ง", "error");
    },
    [toast],
  );

  const handleCopyDeal = useCallback(
    (deal: Deal) =>
      copyPrompt(
        buildFacebookPostPrompt(
          deal,
          deal.steamAppId ? regionalPrices[deal.steamAppId] : undefined,
        ),
        `คัดลอก Prompt ของ ${deal.title} แล้ว`,
      ),
    [copyPrompt, regionalPrices],
  );

  const isBusy = status === "loading" || status === "refreshing";
  const showSkeleton = status === "loading" && deals.length === 0;

  return (
    <>
      <AppHeader
        subtitle={isAdmin ? "เครื่องมือแอดมิน" : "ชี้เป้าเกม PC ลดโหด"}
        busy={isBusy || status === "loadingMore"}
        action={
          <>
          {headerAction}
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={isBusy}
            aria-label="รีเฟรชดีล"
            className="grid size-11 shrink-0 place-items-center rounded-full border border-cabinet-600 text-cream transition hover:border-ember-400 hover:text-ember-400 disabled:opacity-60"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`size-5 ${isBusy ? "animate-spin" : ""}`}
              aria-hidden
            >
              <path d="M21 12a9 9 0 1 1-2.6-6.4" />
              <path d="M21 4v5h-5" />
            </svg>
          </button>
          </>
        }
      >
        <SearchBar value={search} onChange={setSearch} />
        <QuickFilters active={activeFilters} onToggle={toggleFilter} />
      </AppHeader>

      <main className="mx-auto max-w-5xl px-4 pt-4 pb-[calc(2rem+env(safe-area-inset-bottom))]">
        <div className="mb-3 flex min-h-11 items-center justify-between gap-3">
          <p className="text-sm text-cream-dim">
            {showSkeleton ? "กำลังโหลดดีล" : `${visibleDeals.length} ดีล`}
            {updatedAt !== null && ` · อัปเดต ${timeFormatter.format(updatedAt)}`}
          </p>
          {isAdmin && visibleDeals.length > 1 && (
            <button
              type="button"
              onClick={() =>
                copyPrompt(
                  buildRoundupPostPrompt(visibleDeals, regionalPrices),
                  `คัดลอก Prompt รวม ${visibleDeals.length} ดีลแล้ว`,
                )
              }
              className="h-11 rounded-xl border border-gold-400/60 px-4 text-sm font-semibold text-gold-300 transition hover:bg-gold-400/10"
            >
              คัดลอก Prompt รวมดีล
            </button>
          )}
        </div>

        {showSkeleton ? (
          <ArcadeLoader />
        ) : visibleDeals.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <p className="font-pixel text-2xl text-gold-400">GAME OVER</p>
            <p className="text-cream-dim">ยังไม่มีดีลที่ตรงเงื่อนไขตอนนี้</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleDeals.map((deal) => (
              <DealCard
                key={deal.id}
                deal={deal}
                regionalPrice={
                  deal.steamAppId ? regionalPrices[deal.steamAppId] : undefined
                }
                onCopyPrompt={isAdmin ? handleCopyDeal : undefined}
              />
            ))}
          </div>
        )}

        {hasMore && deals.length >= dealsConfig.pageSize && (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => void loadMore()}
              disabled={status === "loadingMore"}
              className="h-12 w-full max-w-xs rounded-xl border border-cabinet-600 text-sm font-semibold text-cream transition hover:border-ember-400 hover:text-ember-400 disabled:opacity-60"
            >
              {status === "loadingMore" ? "กำลังโหลด" : "ดูดีลเพิ่ม"}
            </button>
          </div>
        )}
      </main>
    </>
  );
}
