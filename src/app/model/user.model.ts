export interface Role {
  id: number;
  description: string;
}

export interface User {
  id?: number;
  name: string;
  lastname: string;
  dni: string;
  address: string;
  email: string;
  username: string;
  password: string;
  role: Role;
  avatar?: string | null;
  listCarts?: unknown[];
}

export type CreateUserRequest = Omit<User, 'id' | 'listCarts'>;

