import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { ConsoleService } from '../../../services/console.service';
import { ConsoleCreateRequest } from '../../../model/console.model';
import { ResponseData } from '../../../model/responseData.model';
import { AuthService } from '../../../services/auth.service';

type SelectOpt<T> = { label: string; value: T };

@Component({
  selector: 'app-new-console',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    FloatLabelModule,
    InputTextModule,
    MultiSelectModule,
    ButtonModule,
    ToastModule
  ],
  templateUrl: './new-console.component.html',
  providers: [MessageService]
})
export class NewConsoleComponent {
  model = {
    description: '',
    state: [] as Array<boolean | SelectOpt<boolean>>
  };

  readonly states: SelectOpt<boolean>[] = [
    { label: 'Activa', value: true },
    { label: 'Inactiva', value: false }
  ];

  saving = false;

  constructor(
    private consoleApi: ConsoleService,
    private router: Router,
    private messageService: MessageService,
    private auth: AuthService
  ) {}

  submit(): void {
    if (this.saving) {
      return;
    }
    if (!this.validateForm()) {
      return;
    }
    const payload = this.buildPayload();
    this.saving = true;
    this.consoleApi.createConsole(payload).subscribe({
      next: (res: ResponseData<any>) => {
        const message = res?.message ?? 'Consola registrada correctamente.';
        this.router.navigateByUrl('/list-console', {
          state: {
            responseMessage: message,
            responseSeverity: 'success'
          }
        });
        this.saving = false;
      },
      error: () => {
        this.saving = false;
        this.toastError('Consola', 'No se pudo registrar la consola.');
      }
    });
  }

  private buildPayload(): ConsoleCreateRequest {
    const now = new Date();
    return {
      description: this.model.description.trim(),
      state: this.pickStateValue(),
      createDate: this.toLocalDateTime(now),
      createBy: this.auth.user()?.username ?? 'sistema',
      listVideogames: []
    };
  }

  private pickStateValue(): boolean {
    const raw = Array.isArray(this.model.state) ? this.model.state[0] : (this.model.state as any);
    if (raw && typeof raw === 'object') {
      return Boolean((raw as { value?: boolean }).value);
    }
    return raw !== undefined ? Boolean(raw) : true;
  }

  private validateForm(): boolean {
    if (!this.model.description.trim()) {
      this.toastWarn('Formulario', 'La descripción es obligatoria.');
      return false;
    }
    if ((this.model.state?.length ?? 0) === 0) {
      this.toastWarn('Formulario', 'Debe seleccionar un estado.');
      return false;
    }
    return true;
  }

  private toLocalDateTime(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  private toastWarn(summary: string, detail: string): void {
    this.messageService.add({ severity: 'warn', summary, detail });
  }

  private toastError(summary: string, detail: string): void {
    this.messageService.add({ severity: 'error', summary, detail });
  }
}
