import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { MultiSelectModule } from 'primeng/multiselect';
import { FileUploadHandlerEvent, FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { ImageModule } from 'primeng/image';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { PromoService } from '../../../services/promo.service';
import { Promo, PromoUpdateRequest } from '../../../model/promo.model';
import { ResponseData } from '../../../model/responseData.model';
import { AuthService } from '../../../services/auth.service';

type SelectOpt<T> = { label: string; value: T };

@Component({
  selector: 'app-edit-promo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    FloatLabelModule,
    InputTextModule,
    InputNumberModule,
    DatePickerModule,
    MultiSelectModule,
    FileUploadModule,
    ButtonModule,
    ImageModule,
    ToastModule
  ],
  templateUrl: './edit-promo.component.html',
  providers: [MessageService]
})
export class EditPromoComponent implements OnInit {
  readonly maxFileSize = 5 * 1024 * 1024;
  readonly states: SelectOpt<boolean>[] = [
    { label: 'Activa', value: true },
    { label: 'Inactiva', value: false }
  ];

  model = {
    id: 0,
    description: '',
    discount: 0,
    startDate: null as Date | null,
    endDate: null as Date | null,
    state: [] as Array<boolean | SelectOpt<boolean>>,
    imagePromo: '',
    createBy: '',
    createDate: null as Date | null
  };
  detailsVideogames: any[] = [];
  loading = true;
  saving = false;
  private previewUrl?: SafeUrl;

  constructor(
    private promoApi: PromoService,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private sanitizer: DomSanitizer,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;
    if (!idParam || Number.isNaN(id)) {
      this.toastError('Promoción', 'Identificador no válido.');
      this.router.navigateByUrl('/list-promo');
      return;
    }
    this.loadPromo(id);
  }

  getPreview(): SafeUrl | undefined {
    return this.previewUrl;
  }

  clearImage(): void {
    this.model.imagePromo = '';
    this.previewUrl = undefined;
  }

  onSingleImageUpload(event: FileUploadHandlerEvent): void {
    const file = event.files?.[0];
    if (!file) {
      this.toastWarn('Banner', 'Debe seleccionar un archivo de imagen.');
      this.clearUploadQueue(event);
      return;
    }
    if (!file.type?.startsWith('image/')) {
      this.toastWarn('Banner', 'Solo se permiten archivos de imagen.');
      this.clearUploadQueue(event);
      return;
    }
    if (file.size > this.maxFileSize) {
      this.toastWarn('Banner', 'El archivo supera el tamaño permitido.');
      this.clearUploadQueue(event);
      return;
    }

    this.readFilePayload(file)
      .then(({ raw, preview }) => {
        this.model.imagePromo = raw;
        this.previewUrl = this.sanitizer.bypassSecurityTrustUrl(preview);
        this.messageService.add({
          severity: 'info',
          summary: 'Banner',
          detail: 'Imagen actualizada correctamente.'
        });
      })
      .catch(() => this.toastError('Banner', 'No se pudo leer el archivo seleccionado.'))
      .finally(() => this.clearUploadQueue(event));
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
    this.promoApi.updatePromo(payload).subscribe({
      next: (res: ResponseData<Promo>) => {
        const message = res?.message ?? 'Promoción actualizada correctamente.';
        this.router.navigateByUrl('/list-promo', {
          state: {
            responseMessage: message,
            responseSeverity: 'success'
          }
        });
        this.saving = false;
      },
      error: () => {
        this.saving = false;
        this.toastError('Promoción', 'No se pudo actualizar la promoción.');
      }
    });
  }

  private loadPromo(id: number): void {
    this.loading = true;
    this.promoApi.findById(id).subscribe({
      next: (res: ResponseData<Promo>) => {
        const promo = res?.data;
        if (!promo) {
          this.toastError('Promoción', 'No se encontraron datos para el registro.');
          this.router.navigateByUrl('/list-promo');
          return;
        }
        this.patchModel(promo);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastError('Promoción', 'No se pudo cargar la promoción.');
        this.router.navigateByUrl('/list-promo');
      }
    });
  }

  private patchModel(promo: Promo): void {
    this.model = {
      id: promo.id,
      description: promo.description ?? '',
      discount: this.toPercent(promo.discount),
      startDate: this.toDate(promo.startDate),
      endDate: this.toDate(promo.endDate),
      state: [promo.state ?? true],
      imagePromo: promo.imagePromo ?? '',
      createBy: promo.createBy ?? this.auth.user()?.username ?? 'sistema',
      createDate: this.toDate(promo.createDate)
    };
    this.detailsVideogames = promo.detailsVideogames ?? [];
    this.previewUrl = promo.imagePromo
      ? this.sanitizer.bypassSecurityTrustUrl(this.wrapPreview(promo.imagePromo))
      : undefined;
  }

  private buildPayload(): PromoUpdateRequest {
    const createDate =
      this.model.createDate ?? (this.model.startDate ? this.model.startDate : new Date());
    return {
      id: this.model.id,
      description: this.model.description.trim(),
      discount: this.toDecimalFraction(this.model.discount),
      startDate: this.toLocalDateTime(this.model.startDate),
      endDate: this.toLocalDateTime(this.model.endDate),
      state: this.pickStateValue(),
      imagePromo: this.model.imagePromo,
      createBy: this.model.createBy || this.auth.user()?.username || 'sistema',
      createDate: this.toLocalDateTime(createDate),
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
      this.toastError('Formulario', 'No se identificó la promoción.');
      return false;
    }
    if (!this.model.description.trim()) {
      this.toastWarn('Formulario', 'La descripción es obligatoria.');
      return false;
    }
    if (this.model.discount <= 0) {
      this.toastWarn('Formulario', 'El descuento debe ser mayor a 0%.');
      return false;
    }
    if (!this.model.startDate || !this.model.endDate) {
      this.toastWarn('Formulario', 'Debe seleccionar fechas de inicio y fin.');
      return false;
    }
    if (new Date(this.model.endDate).getTime() <= new Date(this.model.startDate).getTime()) {
      this.toastWarn('Formulario', 'La fecha de fin debe ser posterior a la de inicio.');
      return false;
    }
    if ((this.model.state?.length ?? 0) === 0) {
      this.toastWarn('Formulario', 'Debe seleccionar un estado.');
      return false;
    }
    if (!this.model.imagePromo) {
      this.toastWarn('Formulario', 'Debe adjuntar el banner de la promoción.');
      return false;
    }
    return true;
  }

  private toDecimalFraction(value: number): number {
    const normalized = Number.isFinite(value) ? value : 0;
    const fraction = normalized / 100;
    return Math.max(0, Math.min(1, Number(fraction.toFixed(4))));
  }

  private toPercent(fraction?: number | null): number {
    if (!fraction || !Number.isFinite(fraction)) {
      return 0;
    }
    return Number((fraction * 100).toFixed(2));
  }

  private toLocalDateTime(date: Date | null): string | null {
    if (!date) {
      return null;
    }
    const target = new Date(date);
    const pad = (n: number) => n.toString().padStart(2, '0');
    const year = target.getFullYear();
    const month = pad(target.getMonth() + 1);
    const day = pad(target.getDate());
    const hours = pad(target.getHours());
    const minutes = pad(target.getMinutes());
    const seconds = pad(target.getSeconds());
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  private toDate(value?: Date | string | null): Date | null {
    if (!value) {
      return null;
    }
    const parsed = value instanceof Date ? value : new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  private wrapPreview(image: string): string {
    if (!image) {
      return '';
    }
    const hasPrefix = image.startsWith('data:image');
    return hasPrefix ? image : `data:image/png;base64,${image}`;
  }

  private readFilePayload(file: File): Promise<{ raw: string; preview: string }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const comma = result.indexOf(',');
        const raw = comma >= 0 ? result.substring(comma + 1) : result;
        resolve({ raw, preview: result });
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  private toastWarn(summary: string, detail: string): void {
    this.messageService.add({ severity: 'warn', summary, detail });
  }

  private toastError(summary: string, detail: string): void {
    this.messageService.add({ severity: 'error', summary, detail });
  }

  private clearUploadQueue(event: FileUploadHandlerEvent): void {
    (event as any)?.options?.clear?.();
  }
}
