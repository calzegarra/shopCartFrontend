import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category, CategoryCreateRequest, CategoryUpdateRequest } from '../model/category.model';
import { ResponseData } from '../model/responseData.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  // Backend Java base URL
  private base = 'http://localhost:8080/api/category';

  constructor(private http: HttpClient) {}

  findAllCategories(): Observable<ResponseData<Category[]>> {
    return this.http.get<ResponseData<Category[]>>(`${this.base}/findAll`);
  }

  createCategory(body: CategoryCreateRequest): Observable<ResponseData<Category>> {
    return this.http.post<ResponseData<Category>>(`${this.base}/create`, body);
  }

  findById(id: number | string): Observable<ResponseData<Category>> {
    return this.http.get<ResponseData<Category>>(`${this.base}/findById/${id}`);
  }

  updateCategory(body: CategoryUpdateRequest): Observable<ResponseData<Category>> {
    return this.http.post<ResponseData<Category>>(`${this.base}/update`, body);
  }
}
