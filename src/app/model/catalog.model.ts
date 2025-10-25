export interface DtoCatalog {
  id: number;
  consoleId: number;
  title: string;
  hasDiscount: number; // 0 or 1
  price: number; // BigDecimal serialized as number
  state: string;
  mini: string; // base64 image
}

