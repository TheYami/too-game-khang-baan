/**
 * ค่าตั้งทั้งหมดของแอปอยู่ไฟล์นี้ไฟล์เดียว
 * แก้ชื่อเพจ / Affiliate Tag / เงื่อนไขการดึงดีล ได้ที่นี่โดยไม่ต้องแตะโค้ดส่วนอื่น
 */

export const siteConfig = {
  name: "ตู้เกมข้างบ้าน",
  tagline: "ชี้เป้าเกม PC ลดโหด",
  description:
    "รวมดีลเกม PC บน Steam ที่กำลังลดราคาหนัก ๆ อัปเดตตลอด ชี้เป้าให้ลูกเพจตู้เกมข้างบ้าน",
  /** ชื่อเพจ Facebook ที่ใช้ใน Prompt */
  facebookPageName: "ตู้เกมข้างบ้าน",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  themeColor: "#161b26",
  backgroundColor: "#161b26",
} as const;

export const affiliateConfig = {
  /** Affiliate Tag ของเพจ — ตั้งผ่าน env หรือแก้ค่าหลัง ?? ตรงนี้ได้เลย เว้นว่าง = ไม่ต่อท้ายลิงก์ */
  tag: process.env.NEXT_PUBLIC_AFFILIATE_TAG ?? "",
  /** ชื่อ query parameter ที่เครือข่าย affiliate ของคุณใช้ */
  paramName: "ref",
  /**
   * ปลายทางของปุ่ม "ดูดีล / ซื้อเกม"
   * - "cheapshark" = ลิงก์ redirect ของ CheapShark (พาไปหน้าร้านพร้อมราคาดีล)
   * - "steam"      = หน้าร้าน Steam ของเกมโดยตรง
   */
  linkTarget: "cheapshark" as "cheapshark" | "steam",
} as const;

export const dealsConfig = {
  apiBaseUrl: "https://www.cheapshark.com/api/1.0",
  /** CheapShark ปฏิเสธคำขอฝั่งเซิร์ฟเวอร์ที่ไม่ระบุตัวตน จึงต้องส่งชื่อ client ไปด้วย */
  userAgent: "TooGameKhangBaan/1.0 (Next.js deals site)",
  /** 1 = Steam */
  storeID: "1",
  upperPrice: 15,
  /**
   * การเรียงลำดับเริ่มต้น: "recommended" | "savings" | "reviews" | "price"
   * recommended = Deal Rating ของ CheapShark ซึ่งดันเกมดังที่ลดคุ้มขึ้นมาก่อน
   */
  defaultSort: "recommended",
  /**
   * คะแนนรีวิว Steam ขั้นต่ำของรายการปกติ กันเกมที่ไม่มีใครรู้จักมาบังเกมดัง
   * (ไม่ใช้ตอนค้นหาด้วยชื่อ เพื่อให้หาเกมไหนก็เจอ) — ตั้ง 0 = ไม่กรอง
   */
  minSteamRating: 75,
  pageSize: 12,
  /** อายุ cache ของหน้าแรกฝั่งเซิร์ฟเวอร์ (วินาที) */
  revalidateSeconds: 300,
  /** ดึงใหม่อัตโนมัติขณะเปิดหน้าค้างไว้ (มิลลิวินาที) */
  autoRefreshMs: 5 * 60 * 1000,
} as const;

/** ราคาหน้าร้าน Steam ตามประเทศ — ใช้โชว์ราคาบาทแทน USD */
export const steamConfig = {
  /** รหัสประเทศของร้าน Steam ที่ลูกเพจใช้ซื้อ */
  countryCode: "th",
  /** สัญลักษณ์ที่โชว์หน้าราคา */
  currencySymbol: "฿",
  /** Steam ให้ cache ราคาได้ 1 ชั่วโมง เราเก็บ 10 นาทีเพื่อให้ราคาสดกว่า */
  revalidateSeconds: 600,
  maxAppsPerRequest: 60,
  /** ใช้เทียบราคาเฉพาะเกมที่ Steam ไม่มีราคาบาทให้ (ไม่เคยโชว์ให้ผู้ใช้เห็น) */
  approxThbPerUsd: 35,
} as const;

/** ฟีเจอร์ "สุ่มเกมน่าเล่น" */
export const gachaConfig = {
  /** สุ่มจากเกมที่คะแนนรีวิว Steam ไม่ต่ำกว่านี้ */
  minSteamRating: 80,
  /** จำนวนเกมในกองที่ดึงมาสุ่ม (CheapShark ให้ได้สูงสุด 60 ต่อคำขอ) */
  poolSize: 60,
  /** ราคา USD สูงสุดของกองเมื่อไม่จำกัดงบ */
  upperPriceUsd: 30,
  /** ตัวเลือกงบเป็นบาท — เพิ่ม/ลดได้ตามใจ */
  budgetsThb: [150, 300],
  /** เวลาที่ลูกเต๋าหมุนก่อนเฉลยเกม (มิลลิวินาที) */
  rollMs: 1100,
} as const;

/** เกณฑ์ของปุ่มกรองด่วน */
export const quickFilterThresholds = {
  bigDiscountPercent: 75,
  goodRatingPercent: 80,
  /** เกณฑ์ "ราคาถูก" เป็นบาท ตามราคาร้าน Steam ไทย */
  cheapPriceThb: 150,
  /** ใช้เฉพาะเกมที่ Steam ไม่มีราคาบาทให้ */
  cheapPriceUsd: 5,
} as const;
