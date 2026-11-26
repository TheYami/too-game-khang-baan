import { DealsScreen } from "@/components/DealsScreen";
import { dealsConfig, steamConfig } from "@/config/site";
import { fetchDeals } from "@/lib/cheapshark/client";
import type { Deal } from "@/lib/cheapshark/types";
import { fetchRegionalPrices } from "@/lib/steam/prices";

// สร้างหน้าใหม่เบื้องหลังทุก 5 นาที (ค่าเดียวกับ dealsConfig.revalidateSeconds)
export const revalidate = 300;

async function getInitialDeals(): Promise<Deal[]> {
  try {
    return await fetchDeals(
      {},
      { next: { revalidate: dealsConfig.revalidateSeconds } },
    );
  } catch {
    // API ล่มตอน build/render ก็ยังเปิดหน้าได้ แล้วให้ฝั่ง client ดึงเอง
    return [];
  }
}

export default async function HomePage() {
  const initialDeals = await getInitialDeals();

  // ดึงราคาบาทมาพร้อมกัน หน้าแรกจะได้โชว์ราคาบาทตั้งแต่แรก ไม่กระพริบจาก USD
  const appIds = initialDeals
    .map((deal) => deal.steamAppId)
    .filter((id): id is string => Boolean(id));
  const initialPrices = await fetchRegionalPrices(appIds, {
    next: { revalidate: steamConfig.revalidateSeconds },
  });

  return (
    <DealsScreen
      mode="public"
      initialDeals={initialDeals}
      initialPrices={initialPrices}
    />
  );
}
