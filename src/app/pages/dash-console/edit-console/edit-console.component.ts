import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { ConsoleService } from '../../../services/console.service';
import { Console, ConsoleUpdateRequest } from '../../../model/console.model';
import { ResponseData } from '../../../model/responseData.model';
import { AuthService } from '../../../services/auth.service';

type SelectOpt<T> = { label: string; value: T };

@Component({
  selector: 'app-edit-console',
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
  templateUrl: './edit-console.component.html',
  providers: [MessageService]
})
export class EditConsoleComponent implements OnInit {
  readonly states: SelectOpt<boolean>[] = [
    { label: 'Activa', value: true },
    { label: 'Inactiva', value: false }
  ];

  model = {
    id: 0,
    description: '',
    state: [] as Array<boolean | SelectOpt<boolean>>
  };

  private createDate: Date | null = null;
  private createBy = '';
  private listVideogames: any[] = [];

  loading = true;
  saving = false;

  constructor(
    private consoleApi: ConsoleService,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;
    if (!idParam || Number.isNaN(id)) {
      this.toastError('Consola', 'Identificador no válido.');
      this.router.navigateByUrl('/list-console');
      return;
    }
    this.loadConsole(id);
  }

  submit(): void {
    if (this.saving || this.loading) {
      return;
    }
    if (!this.validateForm()) {
      return;
    }
    const payload = this.buildPayload();
    this.saving = true;
    this.consoleApi.updateConsole(payload).subscribe({
      next: (res: ResponseData<Console>) => {
        const message = res?.message ?? 'Consola actualizada correctamente.';
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
        this.toastError('Consola', 'No se pudo actualizar la consola.');
      }
    });
  }

  private loadConsole(id: number): void {
    this.loading = true;
    this.consoleApi.findById(id).subscribe({
      next: (res: ResponseData<Console>) => {
        const consoleData = res?.data;
        if (!consoleData) {
          this.toastError('Consola', 'No se encontró la consola.');
          this.router.navigateByUrl('/list-console');
          return;
        }
        this.patchModel(consoleData);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastError('Consola', 'No se pudo cargar la consola.');
        this.router.navigateByUrl('/list-console');
      }
    });
  }

  private patchModel(consoleData: Console): void {
    this.model = {
      id: consoleData.id,
      description: consoleData.description ?? '',
      state: [consoleData.state ?? true]
    };
    this.createDate = this.toDate(consoleData.createDate);
    this.createBy = consoleData.createBy ?? this.auth.user()?.username ?? 'sistema';
    this.listVideogames = consoleData.listVideogames ?? [];
  }

  private buildPayload(): ConsoleUpdateRequest {
    const baseDate = this.createDate ?? new Date();
    return {
      id: this.model.id,
      description: this.model.description.trim(),
      state: this.pickStateValue(),
      createDate: this.toLocalDateTime(baseDate),
      createBy: this.createBy || this.auth.user()?.username || 'sistema',
      listVideogames: this.listVideogames ?? []
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
    if (!this.model.id) {
      this.toastError('Formulario', 'No se identificó la consola.');
      return false;
    }
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

  private toDate(value?: Date | string | null): Date | null {
    if (!value) {
      return null;
    }
    const parsed = value instanceof Date ? value : new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  private toastWarn(summary: string, detail: string): void {
    this.messageService.add({ severity: 'warn', summary, detail });
  }

  private toastError(summary: string, detail: string): void {
    this.messageService.add({ severity: 'error', summary, detail });
  }
}
