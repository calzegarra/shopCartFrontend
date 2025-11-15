import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Console, ConsoleCreateRequest, ConsoleUpdateRequest } from '../model/console.model';
import { ResponseData } from '../model/responseData.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ConsoleService {
  // Backend Java base URL
  private base = 'http://localhost:8080/api/console';

  constructor(private http: HttpClient, private auth: AuthService) {}

  findAllConsoles(): Observable<ResponseData<Console[]>> {
    return this.http.get<ResponseData<Console[]>>(`${this.base}/findAll`, { headers: this.buildHeaders() });
  }

  createConsole(body: ConsoleCreateRequest): Observable<ResponseData<Console>> {
    return this.http.post<ResponseData<Console>>(`${this.base}/create`, body, { headers: this.buildHeaders() });
  }

  findById(id: number | string): Observable<ResponseData<Console>> {
    return this.http.get<ResponseData<Console>>(`${this.base}/findById/${id}`, { headers: this.buildHeaders() });
  }

  updateConsole(body: ConsoleUpdateRequest): Observable<ResponseData<Console>> {
    return this.http.post<ResponseData<Console>>(`${this.base}/update`, body, { headers: this.buildHeaders() });
  }

  private buildHeaders(): HttpHeaders | undefined {
    const basic = this.auth.basicToken;
    return basic ? new HttpHeaders({ Authorization: `Basic ${basic}` }) : undefined;
  }
}
