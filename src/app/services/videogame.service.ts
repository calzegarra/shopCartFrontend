import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResponseData } from '../model/responseData.model';
import { Videogame } from '../model/videogame.model';

@Injectable({ providedIn: 'root' })
export class VideogameService {
  private base = 'http://localhost:8080/api/videogame';

  constructor(private http: HttpClient) {}

  create(body: any): Observable<ResponseData<Videogame>> {
    return this.http.post<ResponseData<Videogame>>(`${this.base}/create`, body);
  }

  findById(id: number): Observable<ResponseData<Videogame>> {
    return this.http.get<ResponseData<Videogame>>(`${this.base}/findById/${id}`);
  }

  update(body: Videogame): Observable<ResponseData<Videogame>> {
    return this.http.post<ResponseData<Videogame>>(`${this.base}/update`, body);
  }
}
