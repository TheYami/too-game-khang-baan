"use client";

import { useEffect, useRef, useState } from "react";
import type { Deal } from "@/lib/cheapshark/types";
import { getCoverUrl } from "@/lib/deals/format";
import { buildDealUrl } from "@/lib/deals/links";
import { getDisplayPrice } from "@/lib/deals/pricing";
import type { RegionalPrice } from "@/lib/steam/types";

interface DealCardProps {
  deal: Deal;
  /** ราคาบาทจาก Steam ไทย — ยังไม่มี/ดึงไม่ได้ การ์ดจะโชว์ราคา USD */
  regionalPrice?: RegionalPrice;
  /** ส่งมาเฉพาะโหมดแอดมิน — มีแล้วการ์ดจะโชว์ปุ่มคัดลอก Prompt */
  onCopyPrompt?: (deal: Deal) => void;
}

function ratingTone(percent: number): string {
  if (percent >= 80) return "bg-emerald-400/15 text-emerald-300";
  if (percent >= 60) return "bg-gold-400/15 text-gold-300";
  return "bg-red-400/15 text-red-300";
}

export function DealCard({ deal, regionalPrice, onCopyPrompt }: DealCardProps) {
  const price = getDisplayPrice(deal, regionalPrice);
  const [cover, setCover] = useState(() => getCoverUrl(deal));
  const imgRef = useRef<HTMLImageElement>(null);
  const useThumb = () => setCover(deal.thumb);

  // รูปที่พังไปก่อน React ทำงาน (ตอน SSR) จะไม่ยิง onError จึงเช็คซ้ำตอน mount
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setCover(deal.thumb);
  }, [deal.thumb]);

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-cabinet-700 bg-cabinet-800 shadow-lg shadow-black/20">
      <div className="relative aspect-[460/215] bg-cabinet-700">
        {/* ใช้ <img> ธรรมดา เพื่อให้ export เป็น static/Capacitor ได้โดยไม่ต้องมี image server */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={cover}
          alt={`ปกเกม ${deal.title}`}
          loading="lazy"
          onError={cover === deal.thumb ? undefined : useThumb}
          className="size-full object-cover"
        />
        {price.savingsPercent > 0 && (
          <span className="absolute top-2 left-2 rounded-lg bg-ember-500 px-2 py-1 font-pixel text-sm text-cabinet-950 shadow-[0_2px_0_0_var(--color-ember-600)]">
            -{price.savingsPercent}%
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <h2 className="line-clamp-2 min-h-[2.75rem] text-base leading-snug font-semibold text-cream">
          {deal.title}
        </h2>

        <div className="flex items-end justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl leading-none font-bold text-gold-400">
              {price.sale}
            </span>
            {price.savingsPercent > 0 && (
              <s className="text-sm text-cream-dim">{price.normal}</s>
            )}
          </div>
          {deal.steamRatingPercent !== null ? (
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${ratingTone(deal.steamRatingPercent)}`}
            >
              รีวิว {deal.steamRatingPercent}%
            </span>
          ) : (
            <span className="rounded-full bg-cabinet-700 px-2.5 py-1 text-xs whitespace-nowrap text-cream-dim">
              ยังไม่มีรีวิว
            </span>
          )}
        </div>

        <div className="mt-auto flex flex-col gap-2">
          {onCopyPrompt && (
            <button
              type="button"
              onClick={() => onCopyPrompt(deal)}
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-gold-400 text-sm font-bold text-cabinet-950 transition active:translate-y-0.5 hover:bg-gold-300"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5" aria-hidden>
                <rect x="9" y="9" width="12" height="12" rx="2" />
                <path d="M5 15V5a2 2 0 0 1 2-2h10" />
              </svg>
              คัดลอก Prompt โพสต์เพจ
            </button>
          )}
          <a
            href={buildDealUrl(deal)}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className={`flex h-12 items-center justify-center rounded-xl text-sm font-bold transition active:translate-y-0.5 ${
              onCopyPrompt
                ? "border border-cabinet-600 text-cream hover:border-ember-400 hover:text-ember-400"
                : "bg-ember-500 text-cabinet-950 hover:bg-ember-400"
            }`}
          >
            ดูดีล / ซื้อเกม
          </a>
        </div>
      </div>
    </article>
  );
}
