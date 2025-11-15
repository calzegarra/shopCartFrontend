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

import { CategoryService } from '../../../services/category.service';
import { Category, CategoryUpdateRequest } from '../../../model/category.model';
import { ResponseData } from '../../../model/responseData.model';
import { AuthService } from '../../../services/auth.service';

type SelectOpt<T> = { label: string; value: T };

@Component({
  selector: 'app-edit-category',
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
  templateUrl: './edit-category.component.html',
  providers: [MessageService]
})
export class EditCategoryComponent implements OnInit {
  readonly states: SelectOpt<boolean>[] = [
    { label: 'Activo', value: true },
    { label: 'Inactivo', value: false }
  ];

  model = {
    id: 0,
    description: '',
    state: [] as Array<boolean | SelectOpt<boolean>>
  };

  private createDate: Date | null = null;
  private createBy = '';
  private detailsVideogames: any[] = [];

  loading = true;
  saving = false;

  constructor(
    private categoryApi: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;
    if (!idParam || Number.isNaN(id)) {
      this.toastError('Categoría', 'Identificador inválido.');
      this.router.navigateByUrl('/list-category');
      return;
    }
    this.loadCategory(id);
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
    this.categoryApi.updateCategory(payload).subscribe({
      next: (res: ResponseData<Category>) => {
        const message = res?.message ?? 'Categoría actualizada correctamente.';
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
        this.toastError('Categoría', 'No se pudo actualizar la categoría.');
      }
    });
  }

  private loadCategory(id: number): void {
    this.loading = true;
    this.categoryApi.findById(id).subscribe({
      next: (res: ResponseData<Category>) => {
        const category = res?.data;
        if (!category) {
          this.toastError('Categoría', 'No se encontró la categoría.');
          this.router.navigateByUrl('/list-category');
          return;
        }
        this.patchModel(category);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastError('Categoría', 'No se pudo cargar la categoría.');
        this.router.navigateByUrl('/list-category');
      }
    });
  }

  private patchModel(category: Category): void {
    this.model = {
      id: category.id,
      description: category.description ?? '',
      state: [category.state ?? true]
    };
    this.createDate = this.toDate(category.createDate);
    this.createBy = category.createBy ?? this.auth.user()?.username ?? 'sistema';
    this.detailsVideogames = category.detailsVideogames ?? [];
  }

  private buildPayload(): CategoryUpdateRequest {
    const baseDate = this.createDate ?? new Date();
    return {
      id: this.model.id,
      description: this.model.description.trim(),
      state: this.pickStateValue(),
      createDate: this.toLocalDateTime(baseDate),
      createBy: this.createBy || this.auth.user()?.username || 'sistema',
      detailsVideogames: this.detailsVideogames ?? []
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
      this.toastError('Formulario', 'No se identificó la categoría.');
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
