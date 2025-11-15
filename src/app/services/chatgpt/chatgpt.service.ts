import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { ResponseData } from '../../model/responseData.model';

type ChatReply = { reply: string };

@Injectable({
  providedIn: 'root'
})
export class ChatGptService {
  private readonly apiUrl = '/api/chatgpt/ask';

  constructor(private http: HttpClient) {}

  sendMessage(message: string): Observable<ChatReply> {
    return this.http.post<ResponseData<ChatReply>>(this.apiUrl, { message }).pipe(
      map((res) => res?.data ?? { reply: 'No se obtuvo respuesta del asistente.' }),
      catchError(() => of({ reply: 'Lo siento, ocurrió un error al contactar al asistente.' }))
    );
  }
}
