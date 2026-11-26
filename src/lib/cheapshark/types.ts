/** รูปข้อมูลดิบจาก CheapShark (ทุกค่าเป็น string) */
export interface CheapSharkDealRaw {
  internalName: string;
  title: string;
  metacriticLink: string | null;
  dealID: string;
  storeID: string;
  gameID: string;
  salePrice: string;
  normalPrice: string;
  isOnSale: string;
  savings: string;
  metacriticScore: string;
  steamRatingText: string | null;
  steamRatingPercent: string;
  steamRatingCount: string;
  steamAppID: string | null;
  releaseDate: number;
  lastChange: number;
  dealRating: string;
  thumb: string;
}

/** รูปข้อมูลที่แอปใช้จริง — UI และแอปมือถือในอนาคตอ้างอิงตัวนี้เท่านั้น */
export interface Deal {
  id: string;
  gameId: string;
  steamAppId: string | null;
  title: string;
  thumb: string;
  normalPrice: number;
  salePrice: number;
  /** เปอร์เซ็นต์ส่วนลด 0-100 (ทศนิยมตามที่ API ให้มา) */
  savings: number;
  /** null = ยังไม่มีคะแนนรีวิว */
  steamRatingPercent: number | null;
  steamRatingText: string | null;
  steamRatingCount: number;
  metacriticScore: number | null;
}

export interface DealsQuery {
  /** ค้นหาตามชื่อเกม */
  title?: string;
  /** ราคาสูงสุด (USD) */
  upperPrice?: number;
  /** คะแนนรีวิว Steam ขั้นต่ำ */
  steamRating?: number;
  /** หน้า เริ่มที่ 0 */
  pageNumber?: number;
}
