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
  detailsVideogames?: any[];
}

export interface PromoCreateRequest {
  description: string;
  discount: number;
  startDate: string | null;
  endDate: string | null;
  state: boolean;
  imagePromo: string;
  createDate: string | null;
  createBy: string;
  detailsVideogames: any[];
}

export interface PromoUpdateRequest extends PromoCreateRequest {
  id: number;
}
