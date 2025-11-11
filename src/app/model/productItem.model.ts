import { User } from './user.model';

export interface DtoProductItem {
  videogameId: number;
  amount: number;
  unitPrice: number;
  unitDiscount: number;
  subtotal: number;
}

export interface DtoBuyItems {
  user: User;
  detailItems: DtoProductItem[];
}
