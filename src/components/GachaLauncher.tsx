"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gachaConfig, steamConfig } from "@/config/site";
import { useGacha } from "@/hooks/useGacha";
import { DealCard } from "./DealCard";

/** 0 = ไม่จำกัดงบ */
const BUDGETS: { value: number; label: string }[] = [
  { value: 0, label: "ทุกราคา" },
  ...gachaConfig.budgetsThb.map((value) => ({
    value,
    label: `ไม่เกิน ${steamConfig.currencySymbol}${value}`,
  })),
];

/** ปุ่ม "สุ่มเกมน่าเล่น" บนหน้าแรก + หน้าต่างสุ่ม */
export function GachaLauncher() {
  const [open, setOpen] = useState(false);
  const [budget, setBudget] = useState(0);
  const { status, deal, reelTitle, regionalPrice, roll, stop } = useGacha();
  const dialogRef = useRef<HTMLDialogElement>(null);

  // ใช้ <dialog> ของเบราว์เซอร์: ได้ Esc ปิด, ล็อกโฟกัส และฉากหลังมาให้เลย
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const openAndRoll = useCallback(() => {
    setOpen(true);
    void roll(budget);
  }, [budget, roll]);

  const close = useCallback(() => {
    stop();
    setOpen(false);
  }, [stop]);

  const changeBudget = useCallback(
    (value: number) => {
      setBudget(value);
      void roll(value);
    },
    [roll],
  );

  const spinning = status === "loading" || status === "rolling";

  return (
    <>
      <button
        type="button"
        onClick={openAndRoll}
        className="mb-4 flex h-14 w-full items-center justify-center gap-2 rounded-2xl border-2 border-gold-300 bg-gradient-to-r from-ember-500 to-gold-400 text-base font-bold text-cabinet-950 shadow-[0_4px_0_0_var(--color-ember-600)] transition hover:brightness-105 active:translate-y-1 active:shadow-none"
      >
        <span aria-hidden className="text-xl">
          🎲
        </span>
        สุ่มเกมน่าเล่น
      </button>

      <dialog
        ref={dialogRef}
        onClose={close}
        onClick={(event) => {
          // คลิกโดนตัว <dialog> เอง = คลิกฉากหลังนอกกล่อง
          if (event.target === dialogRef.current) close();
        }}
        aria-labelledby="gacha-title"
        className="m-auto w-[calc(100%-2rem)] max-w-sm overflow-visible rounded-3xl border-2 border-gold-400 bg-cabinet-900 p-0 text-cream shadow-2xl shadow-black/60 backdrop:bg-black/75 backdrop:backdrop-blur-sm"
      >
        <div className="flex flex-col gap-4 p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 id="gacha-title" className="text-lg font-bold">
              <span aria-hidden>🎲 </span>สุ่มเกมน่าเล่น
            </h2>
            <button
              type="button"
              onClick={close}
              aria-label="ปิด"
              className="grid size-11 place-items-center rounded-full text-cream-dim hover:bg-cabinet-700 hover:text-cream"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="size-5" aria-hidden>
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>

          <div role="group" aria-label="งบประมาณ" className="flex gap-2">
            {BUDGETS.map((option) => {
              const selected = option.value === budget;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => changeBudget(option.value)}
                  className={`h-10 flex-1 rounded-full border text-sm font-medium whitespace-nowrap transition-colors ${
                    selected
                      ? "border-gold-400 bg-gold-400 text-cabinet-950"
                      : "border-cabinet-600 bg-cabinet-800 text-cream hover:border-gold-400/60"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          {/* เวที: ความสูงขั้นต่ำคงที่ กล่องจะได้ไม่กระตุกตอนสลับระหว่างหมุนกับเฉลย */}
          <div aria-live="polite" className="flex min-h-[21rem] flex-col justify-center">
            {spinning && (
              <div className="flex flex-col items-center gap-5 py-6">
                <span aria-hidden className="dice-roll text-7xl leading-none">
                  🎲
                </span>
                <p className="h-12 w-full overflow-hidden px-2 text-center font-semibold text-gold-300">
                  {status === "rolling" ? reelTitle : "กำลังเขย่าลูกเต๋า"}
                </p>
              </div>
            )}

            {status === "result" && deal && (
              <div key={deal.id} className="gacha-pop">
                <DealCard deal={deal} regionalPrice={regionalPrice} />
              </div>
            )}

            {status === "empty" && (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <p className="font-pixel text-2xl text-gold-400">GAME OVER</p>
                <p className="text-cream-dim">ยังไม่มีเกมในงบนี้ตอนนี้</p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => void roll(budget)}
            disabled={spinning}
            className="h-12 rounded-xl border-2 border-gold-400 text-sm font-bold text-gold-300 transition hover:bg-gold-400/10 active:translate-y-0.5 disabled:opacity-50"
          >
            สุ่มใหม่
          </button>
        </div>
      </dialog>
    </>
  );
}
