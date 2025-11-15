export interface Console {
  id: number;
  description: string;
  state: boolean;
  createDate: Date;
  createBy: string;
  listVideogames?: any[];
}

export interface ConsoleCreateRequest {
  description: string;
  state: boolean;
  createDate: string | null;
  createBy: string;
  listVideogames: any[];
}

export interface ConsoleUpdateRequest extends ConsoleCreateRequest {
  id: number;
}
