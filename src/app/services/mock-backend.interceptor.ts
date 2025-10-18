import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { Employee } from '../model/employee.model';

const MOCK_EMPLOYEES: Employee[] = [
  { id: 1, name: 'María', lastname: 'García', role: 'Dev', department: 'IT', hireDate: '2022-01-10', status: 'ACTIVE', avatar: '' },
  { id: 2, name: 'Juan', lastname: 'Pérez', role: 'QA', department: 'IT', hireDate: '2021-11-03', status: 'ACTIVE' },
  { id: 3, name: 'Lucía', lastname: 'Lopez', role: 'HR', department: 'HR', hireDate: '2020-05-20', status: 'INACTIVE' },
  { id: 4, name: 'Pedro', lastname: 'Diaz', role: 'Sales', department: 'Sales', hireDate: '2023-03-14', status: 'ACTIVE' },
  { id: 5, name: 'Ana', lastname: 'Rios', role: 'Ops', department: 'Operations', hireDate: '2019-08-01', status: 'ACTIVE' },
  { id: 6, name: 'Sofia', lastname: 'Martinez', role: 'Sales', department: 'Sales', hireDate: '2024-01-20', status: 'INACTIVE' },
];

function computeStats(list: Employee[]) {
  const total = list.length;
  const active = list.filter(e => e.status === 'ACTIVE').length;
  const inactive = total - active;
  const depMap = new Map<string, number>();
  list.forEach(e => depMap.set(e.department, (depMap.get(e.department) ?? 0) + 1));
  const byDepartment = Array.from(depMap.entries()).map(([name, value]) => ({ name, value }));
  return { total, active, inactive, byDepartment };
}

@Injectable()
export class MockBackendInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Fake latency
    const respond = (body: any, status = 200) => of(new HttpResponse({ status, body })).pipe(delay(300));

    if (req.url.endsWith('/api/employee/findAll') && req.method === 'GET') {
      return respond(MOCK_EMPLOYEES);
    }

    if (req.url.endsWith('/api/employee/stats') && req.method === 'GET') {
      return respond(computeStats(MOCK_EMPLOYEES));
    }

    if (req.url.endsWith('/api/auth/login') && req.method === 'POST') {
      const { username, password } = req.body || {};
      if (username && password) {
        return respond({ token: 'fake-jwt-token', user: { username } });
      }
      return respond({ message: 'Credenciales inválidas' }, 401);
    }

    return next.handle(req);
  }
}

