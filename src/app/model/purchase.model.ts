export interface DtoMyProducts {
  title: string;
  amount: number;
  unitPrice: number | null;
  unitDiscount: number;
  subtotal: number;
  mini: string;
}

export interface DtoPurchases {
  user: string;
  detailItems: DtoMyProducts[];
  total: number;
  createDate: string;
}
