import { steamConfig } from "@/config/site";
import { fetchRegionalPrices, sanitizeAppIds } from "@/lib/steam/prices";

/** GET /api/steam-prices?ids=620,400 → { "620": { currency, normal, sale, discountPercent } } */
export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get("ids") ?? "";
  const ids = sanitizeAppIds(raw.split(","));

  const prices = await fetchRegionalPrices(ids, {
    next: { revalidate: steamConfig.revalidateSeconds },
  });

  return Response.json(prices, {
    headers: {
      // ให้ CDN ของ Vercel เก็บคำตอบไว้ ลดจำนวนครั้งที่ต้องไปถาม Steam
      "Cache-Control": `public, s-maxage=${steamConfig.revalidateSeconds}, stale-while-revalidate=${steamConfig.revalidateSeconds}`,
    },
  });
}
