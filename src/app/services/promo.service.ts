import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Promo, PromoCreateRequest, PromoUpdateRequest } from '../model/promo.model';
import { ResponseData } from '../model/responseData.model';

@Injectable({ providedIn: 'root' })
export class PromoService {
  // Backend Java base URL
  private base = 'http://localhost:8080/api/promo';

  constructor(private http: HttpClient) {}

  findAllPromos(): Observable<ResponseData<Promo[]>> {
    return this.http.get<ResponseData<Promo[]>>(`${this.base}/findAll`);
  }

  createPromo(body: PromoCreateRequest): Observable<ResponseData<Promo>> {
    return this.http.post<ResponseData<Promo>>(`${this.base}/create`, body);
  }

  findById(id: number | string): Observable<ResponseData<Promo>> {
    return this.http.get<ResponseData<Promo>>(`${this.base}/findById/${id}`);
  }

  updatePromo(body: PromoUpdateRequest): Observable<ResponseData<Promo>> {
    return this.http.post<ResponseData<Promo>>(`${this.base}/update`, body);
  }
}
