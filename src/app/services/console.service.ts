import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Console } from '../model/console.model';
import { ResponseData } from '../model/responseData.model';

@Injectable({ providedIn: 'root' })
export class ConsoleService {
  // Backend Java base URL
  private base = 'http://localhost:8080/api/console';

  constructor(private http: HttpClient) {}

  findAllConsoles(): Observable<ResponseData<Console[]>> {
    return this.http.get<ResponseData<Console[]>>(`${this.base}/findAll`);
  }
}
