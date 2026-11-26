import { affiliateConfig } from "@/config/site";
import type { Deal } from "@/lib/cheapshark/types";

/** ลิงก์ของปุ่ม "ดูดีล / ซื้อเกม" พร้อมต่อ Affiliate Tag จาก config */
export function buildDealUrl(deal: Deal): string {
  const useSteam = affiliateConfig.linkTarget === "steam" && deal.steamAppId;

  // dealID จาก CheapShark ถูก URL-encode มาแล้ว จึงต่อสตริงตรง ๆ ไม่ encode ซ้ำ
  let url = useSteam
    ? `https://store.steampowered.com/app/${deal.steamAppId}/`
    : `https://www.cheapshark.com/redirect?dealID=${deal.id}`;

  if (affiliateConfig.tag) {
    const separator = url.includes("?") ? "&" : "?";
    url += `${separator}${affiliateConfig.paramName}=${encodeURIComponent(affiliateConfig.tag)}`;
  }
  return url;
}
