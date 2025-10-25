import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../model/category.model';
import { ResponseData } from '../model/responseData.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  // Backend Java base URL
  private base = 'http://localhost:8080/api/category';

  constructor(private http: HttpClient) {}

  findAllCategories(): Observable<ResponseData<Category[]>> {
    return this.http.get<ResponseData<Category[]>>(`${this.base}/findAll`);
  }
}
