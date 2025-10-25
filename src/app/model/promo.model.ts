export interface Promo {
  id: number;
  description: string;
  discount: number;
  startDate: Date;
  endDate: Date;
  state: boolean;
  imagePromo: string; 
  createDate: Date;
  createBy: string;
}