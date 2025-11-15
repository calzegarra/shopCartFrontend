export interface Category {
  id: number;
  description: string;
  state: boolean;
  createDate: Date;
  createBy: string;
  detailsVideogames?: any[];
}

export interface CategoryCreateRequest {
  description: string;
  state: boolean;
  createDate: string | null;
  createBy: string;
  detailsVideogames: any[];
}

export interface CategoryUpdateRequest extends CategoryCreateRequest {
  id: number;
}
