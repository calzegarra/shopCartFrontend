export interface Employee {
  id: number;
  name: string;
  lastname: string;
  role: string;
  department: string;
  hireDate: string;
  status: 'ACTIVE' | 'INACTIVE';
  avatar?: string;
}
