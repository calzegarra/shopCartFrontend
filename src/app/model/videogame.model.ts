export interface ConsoleModel {
  id: number;
  description: string;
  state: boolean;
  createDate?: string;
  createBy?: string;
}

export interface CategoryModel {
  id: number;
  description: string;
  state: boolean;
  createDate?: string;
  createBy?: string;
}

export interface Videogame {
  id: number;
  console: ConsoleModel;
  title: string;
  description: string;
  hasDiscount: boolean;
  stock: number;
  price: number;
  state: string;
  image: string;
  image2: string; // base64
  image3: string; // base64
  mini: string;   // base64
  detailsPromo: any[]; // Not used in UI for now
  detailsCategories: CategoryModel[];
}

