const BLOCKS = 10;
const DOTS = 3;

/** หน้าจอโหลดสไตล์ตู้เกม: เหรียญหมุน + แถบพลังพิกเซลวิ่ง (CSS ล้วน ไม่มี JS) */
export function ArcadeLoader({ label = "กำลังโหลดดีล" }: { label?: string }) {
  return (
    <div
      role="status"
      aria-label={label}
      className="flex flex-col items-center gap-6 py-20"
    >
      {/* เหรียญ + เงาบนพื้น */}
      <div className="flex flex-col items-center gap-2" aria-hidden>
        <div className="coin-flip grid size-16 place-items-center rounded-full border-4 border-gold-500 bg-gold-400 shadow-[inset_-4px_-4px_0_0_var(--color-gold-500),inset_4px_4px_0_0_var(--color-gold-300)]">
          <span className="font-pixel text-2xl font-bold text-ember-600">฿</span>
        </div>
        <div className="coin-shadow h-1.5 w-12 rounded-full bg-black/40" />
      </div>

      <p aria-hidden className="font-pixel text-lg tracking-widest text-gold-400">
        NOW LOADING
        {Array.from({ length: DOTS }, (_, index) => (
          <span
            key={index}
            className="block-fill"
            style={{ animationDelay: `${index * 200}ms` }}
          >
            .
          </span>
        ))}
      </p>

      {/* แถบพลังแบบพิกเซล */}
      <div
        aria-hidden
        className="flex gap-1.5 rounded-lg border-2 border-cabinet-600 bg-cabinet-950 p-1.5"
      >
        {Array.from({ length: BLOCKS }, (_, index) => (
          <span
            key={index}
            className={`block-fill h-4 w-3 rounded-[2px] ${
              index < BLOCKS - 3 ? "bg-gold-400" : "bg-ember-500"
            }`}
            style={{ animationDelay: `${index * 110}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
