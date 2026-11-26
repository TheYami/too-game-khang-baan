/** ราคาหน้าร้าน Steam ตามประเทศที่ตั้งใน steamConfig (ค่าเริ่มต้น = ไทย) */
export interface RegionalPrice {
  /** รหัสสกุลเงินที่ Steam ตอบมา เช่น "THB" */
  currency: string;
  /** ราคาปกติ หน่วยเป็นบาท (แปลงจากสตางค์แล้ว) */
  normal: number;
  /** ราคาที่ต้องจ่ายตอนนี้ */
  sale: number;
  /** เปอร์เซ็นต์ส่วนลดของร้านโซนนี้ 0-100 */
  discountPercent: number;
}

/** key = steamAppId */
export type RegionalPriceMap = Record<string, RegionalPrice>;
