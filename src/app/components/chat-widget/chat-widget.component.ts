import { Component, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ChatGptService } from '../../services/chatgpt/chatgpt.service';
import { firstValueFrom } from 'rxjs';

type ChatMessage = { role: 'user' | 'bot'; content: string };

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './chat-widget.component.html',
  styleUrls: ['./chat-widget.component.css']
})
export class ChatWidgetComponent {
  isOpen = false;
  isSending = false;
  inputMessage = '';
  messages = signal<ChatMessage[]>([
    { role: 'bot', content: '¡Hola! Soy el Asistente Future. ¿En qué puedo ayudarte hoy?' }
  ]);

  constructor(private chat: ChatGptService) {}

  toggle() {
    this.isOpen = !this.isOpen;
  }

  async send() {
    const text = this.inputMessage?.trim();
    if (!text || this.isSending) return;

    this.messages.update(list => [...list, { role: 'user', content: text }]);
    this.inputMessage = '';
    this.isSending = true;
    try {
      const response = await firstValueFrom(this.chat.sendMessage(text));
      const reply = response?.reply ?? 'Lo siento, no pude procesar tu mensaje.';
      this.messages.update(list => [...list, { role: 'bot', content: reply }]);
    } catch (err) {
      this.messages.update(list => [...list, { role: 'bot', content: 'Ocurrió un error al contactar el asistente.' }]);
    } finally {
      this.isSending = false;
    }
  }
}
