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

import { CategoryService } from '../../../services/category.service';
import { CategoryCreateRequest } from '../../../model/category.model';
import { ResponseData } from '../../../model/responseData.model';
import { AuthService } from '../../../services/auth.service';

type SelectOpt<T> = { label: string; value: T };

@Component({
  selector: 'app-new-category',
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
  templateUrl: './new-category.component.html',
  providers: [MessageService]
})
export class NewCategoryComponent {
  model = {
    description: '',
    state: [] as Array<boolean | SelectOpt<boolean>>
  };

  readonly states: SelectOpt<boolean>[] = [
    { label: 'Activo', value: true },
    { label: 'Inactivo', value: false }
  ];

  saving = false;

  constructor(
    private categoryApi: CategoryService,
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
    this.categoryApi.createCategory(payload).subscribe({
      next: (res: ResponseData<any>) => {
        const message = res?.message ?? 'Categoría registrada correctamente.';
        this.router.navigateByUrl('/list-category', {
          state: {
            responseMessage: message,
            responseSeverity: 'success'
          }
        });
        this.saving = false;
      },
      error: () => {
        this.saving = false;
        this.toastError('Categoría', 'No se pudo registrar la categoría.');
      }
    });
  }

  private buildPayload(): CategoryCreateRequest {
    const now = new Date();
    return {
      description: this.model.description.trim(),
      state: this.pickStateValue(),
      createDate: this.toLocalDateTime(now),
      createBy: this.auth.user()?.username ?? 'sistema',
      detailsVideogames: []
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
