import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee } from '../model/employee.model';

export interface EmployeeStats {
  total: number;
  active: number;
  inactive: number;
  byDepartment: { name: string; value: number }[];
}

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private base = '/api/employee';

  constructor(private http: HttpClient) {}

  findAll(): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.base}/findAll`);
  }

  stats(): Observable<EmployeeStats> {
    return this.http.get<EmployeeStats>(`${this.base}/stats`);
  }
}

