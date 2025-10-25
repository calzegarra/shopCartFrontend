import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DtoCatalog } from '../model/catalog.model';
import { ResponseData } from '../model/responseData.model';
import { Videogame } from '../model/videogame.model';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  // Backend Java base URL
  private base = 'http://localhost:8080/api/videogame';

  constructor(private http: HttpClient) {}

  findCatalog(): Observable<ResponseData<DtoCatalog[]>> {
    return this.http.get<ResponseData<DtoCatalog[]>>(`${this.base}/findCatalog`);
  }

  findById(id: number): Observable<ResponseData<Videogame>> {
    return this.http.get<ResponseData<Videogame>>(`${this.base}/findById/${id}`);
  }
}
