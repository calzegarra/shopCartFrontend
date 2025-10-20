import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DtoCatalog, ResponseData } from '../model/catalog.model';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  // Backend Java base URL
  private base = 'http://localhost:8080/api/videogame';

  constructor(private http: HttpClient) {}

  findCatalog(): Observable<ResponseData<DtoCatalog[]>> {
    return this.http.get<ResponseData<DtoCatalog[]>>(`${this.base}/findCatalog`);
  }
}
