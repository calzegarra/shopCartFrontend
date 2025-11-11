import { User } from './user.model';

export interface DtoMyCart {
  cartId: number;
  userId: number;
  total: number;
  createDate: string;
}

export interface CartVideogameDetail {
  id: number;
  title: string;
  description: string;
  mini: string | null;
  price?: number | null;
  file?: string | null;
}

export interface CartDetail {
  id: number;
  user: User;
  cartState: string;
  total: number;
  createDate: string;
  detailsVideogames: CartVideogameDetail[];
}
