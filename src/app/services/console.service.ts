import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Console } from '../model/console.model';
import { ResponseData } from '../model/responseData.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ConsoleService {
  // Backend Java base URL
  private base = 'http://localhost:8080/api/console';

  constructor(private http: HttpClient, private auth: AuthService) {}

  findAllConsoles(): Observable<ResponseData<Console[]>> {
    // Spring Security ahora protege este endpoint con Basic Auth (rol EMPLEADO).
    // En Postman se envía Basic <base64(username:password)>, replicamos eso.
    const basic = this.auth.basicToken;
    const headers = basic ? new HttpHeaders({ Authorization: `Basic ${basic}` }) : undefined;
    return this.http.get<ResponseData<Console[]>>(`${this.base}/findAll`, { headers });
  }
}
