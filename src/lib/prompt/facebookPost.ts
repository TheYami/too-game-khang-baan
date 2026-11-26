import { siteConfig } from "@/config/site";
import type { Deal } from "@/lib/cheapshark/types";
import { buildDealUrl } from "@/lib/deals/links";
import { getDisplayPrice } from "@/lib/deals/pricing";
import type { RegionalPrice, RegionalPriceMap } from "@/lib/steam/types";

function describeDeal(deal: Deal, regional?: RegionalPrice): string {
  const price = getDisplayPrice(deal, regional);
  const source = price.isRegional ? "ราคาร้าน Steam ไทย" : "ราคา USD";

  const lines = [
    `- ชื่อเกม: ${deal.title}`,
    `- ร้านค้า: Steam`,
    `- ราคาปกติ: ${price.normal} (${source})`,
    `- ราคาลดแล้ว: ${price.sale} (${source})`,
    `- ส่วนลด: ${price.savingsPercent}%`,
  ];
  if (deal.steamRatingPercent !== null) {
    const detail = [
      deal.steamRatingText,
      deal.steamRatingCount > 0
        ? `${deal.steamRatingCount.toLocaleString("en-US")} รีวิว`
        : null,
    ]
      .filter(Boolean)
      .join(", ");
    lines.push(
      `- คะแนนรีวิว Steam: ${deal.steamRatingPercent}%${detail ? ` (${detail})` : ""}`,
    );
  } else {
    lines.push(`- คะแนนรีวิว Steam: ยังไม่มีข้อมูล`);
  }
  if (deal.metacriticScore !== null) {
    lines.push(`- คะแนน Metacritic: ${deal.metacriticScore}`);
  }
  lines.push(`- ลิงก์ดีล: ${buildDealUrl(deal)}`);
  return lines.join("\n");
}

const PERSONA = `คุณคือแอดมินเพจ Facebook "${siteConfig.facebookPageName}" เพจชี้เป้าเกม PC ลดราคา น้ำเสียงเป็นกันเอง อบอุ่น เหมือนพี่ข้างบ้านที่ชอบเล่นเกมแล้วมาบอกต่อ`;

const PRICE_RULE =
  "ใช้ตัวเลขราคาตามข้อมูลที่ให้เท่านั้น ห้ามแปลงสกุลเงินหรือปัดเลขเอง — เกมไหนให้ราคาเป็นบาทมาแล้วให้ใช้ราคาบาทนั้นเลย เกมไหนให้มาเป็น USD ให้เขียนเป็น USD และบอกว่าราคาบาทดูได้ที่หน้าร้าน";

/** Prompt สำหรับโพสต์ชี้เป้าเกมเดียว */
export function buildFacebookPostPrompt(
  deal: Deal,
  regional?: RegionalPrice,
): string {
  return `${PERSONA}

ช่วยเขียนโพสต์ Facebook ชี้เป้าดีลเกมนี้ 1 โพสต์

ข้อมูลเกม
${describeDeal(deal, regional)}

เงื่อนไขการเขียน
1. เปิดด้วยประโยคสั้น ๆ ที่หยุดนิ้วคนเลื่อนฟีด โดยชูส่วนลดหรือราคาเป็นจุดขาย
2. เล่าสั้น ๆ ว่าเกมนี้เป็นเกมแนวไหน เล่นแล้วได้อะไร เหมาะกับใคร — ถ้าไม่แน่ใจข้อมูลเกม ให้บอกแบบกว้าง ๆ ห้ามแต่งรายละเอียดขึ้นเอง
3. บอกราคาปกติ ราคาลด และเปอร์เซ็นต์ส่วนลดให้ชัด ${PRICE_RULE}
4. ถ้ามีคะแนนรีวิว ให้หยิบมาช่วยยืนยันความคุ้ม
5. ปิดด้วยประโยคชวนกดลิงก์ แล้ววางลิงก์ดีลไว้บรรทัดสุดท้ายก่อนแฮชแท็ก
6. ความยาวไม่เกิน 8 บรรทัด ใช้อีโมจิพอประมาณ ไม่ใช้คำหยาบ
7. ปิดท้ายด้วยแฮชแท็ก 3-5 อัน โดยต้องมี #${siteConfig.facebookPageName}

ตอบกลับมาเฉพาะตัวโพสต์ที่พร้อมคัดลอกไปวางได้เลย`;
}

/** Prompt สำหรับโพสต์รวมหลายดีลในโพสต์เดียว */
export function buildRoundupPostPrompt(
  deals: Deal[],
  regionalPrices: RegionalPriceMap = {},
): string {
  const blocks = deals
    .map((deal, index) => {
      const regional = deal.steamAppId
        ? regionalPrices[deal.steamAppId]
        : undefined;
      return `เกมที่ ${index + 1}\n${describeDeal(deal, regional)}`;
    })
    .join("\n\n");

  return `${PERSONA}

ช่วยเขียนโพสต์ Facebook แบบ "รวมดีลเด็ดวันนี้" จากรายการเกม ${deals.length} เกมด้านล่าง

${blocks}

เงื่อนไขการเขียน
1. เปิดด้วยประโยคสั้น ๆ ที่บอกว่าวันนี้มีเกมลดโหดกี่เกม
2. ไล่ทีละเกมเป็นข้อ ๆ ข้อละ 1-2 บรรทัด: ชื่อเกม ราคาปกติ → ราคาลด เปอร์เซ็นต์ส่วนลด และจุดเด่นสั้น ๆ พร้อมลิงก์ดีลของเกมนั้น
3. ${PRICE_RULE}
4. ถ้าไม่แน่ใจข้อมูลเกมไหน ให้บอกแค่ราคาและส่วนลด ห้ามแต่งรายละเอียดขึ้นเอง
5. ปิดด้วยประโยคชวนแชร์ให้เพื่อนที่กำลังหาเกมเล่น
6. ใช้อีโมจิพอประมาณ ไม่ใช้คำหยาบ และปิดท้ายด้วยแฮชแท็ก 3-5 อัน โดยต้องมี #${siteConfig.facebookPageName}

ตอบกลับมาเฉพาะตัวโพสต์ที่พร้อมคัดลอกไปวางได้เลย`;
}
