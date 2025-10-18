import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatGptService {

  private apiUrl = 'https://api.openai.com/v1/chat/completions';
  private apiKey = 'TU_API_KEY_AQUI'; // ⚠️ NO dejar esto en producción

  constructor(private http: HttpClient) {}

  sendMessage(message: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    });

    const body = {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Eres un asistente amigable para clientes de Future Store.' },
        { role: 'user', content: message }
      ]
    };

    return this.http.post(this.apiUrl, body, { headers });
  }
}
