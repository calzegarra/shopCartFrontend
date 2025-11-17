import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

// PrimeNG
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { FieldsetModule } from 'primeng/fieldset';
import { TextareaModule } from 'primeng/textarea';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { MultiSelectModule } from 'primeng/multiselect';
import { FileUpload, FileUploadHandlerEvent, FileSelectEvent, FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { ImageModule } from 'primeng/image';
import { ToastModule } from 'primeng/toast';
import { ProgressBarModule } from 'primeng/progressbar';
import { BadgeModule } from 'primeng/badge';
import { MessageService } from 'primeng/api';
import { ConsoleService } from '../../../services/console.service';
import { PromoService } from '../../../services/promo.service';
import { CategoryService } from '../../../services/category.service';
import { VideogameService } from '../../../services/videogame.service';
import { Console } from '../../../model/console.model';
import { Promo } from '../../../model/promo.model';
import { Category } from '../../../model/category.model';
import { ResponseData } from '../../../model/responseData.model';
import { Videogame } from '../../../model/videogame.model';

type SelectOpt = { label: string; value: any };
type ImageField = 'image' | 'image2' | 'image3';

@Component({
  selector: 'app-new-videogame',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    FloatLabelModule,
    InputTextModule,
    FieldsetModule,
    TextareaModule,
    CheckboxModule,
    InputNumberModule,
    MultiSelectModule,
    FileUploadModule,
    ButtonModule,
    ImageModule,
    ToastModule,
    ProgressBarModule,
    BadgeModule
  ],
  templateUrl: './new-videogame.component.html',
  providers: [MessageService]
})
export class NewVideogameComponent implements OnInit {
  @ViewChild('archiveUpload') archiveUpload?: FileUpload;

  // form model
  model: any = {
    console: [] as (Console | null)[],
    title: '',
    description: '',
    hasDiscount: false,
    stock: 0,
    price: 0,
    state: [] as string[],
    image: '',
    image2: '',
    image3: '',
    mini: '',
    file: '',
    detailsPromo: [] as Promo[],
    detailsCategories: [] as Category[]
  };

  // select sources
  consoles: SelectOpt[] = [];
  states: SelectOpt[] = [
    { label: 'Activo', value: 'Activo' },
    { label: 'Sin Stock', value: 'Sin Stock' },
    { label: 'Inactivo', value: 'Inactivo' }
  ];

  promos: Promo[] = [];
  categories: Category[] = [];
  selectedPromos: Promo[] = [];
  selectedCategories: Category[] = [];
  readonly imageInputs: { key: ImageField; label: string }[] = [
    { key: 'image', label: 'Imagen principal' },
    { key: 'image2', label: 'Imagen secundaria' },
    { key: 'image3', label: 'Imagen terciaria' }
  ];
  imagePreviews: Record<ImageField, string | null> = {
    image: null,
    image2: null,
    image3: null
  };
  readonly maxFileSize = 20 * 1024 * 1024; // ~20MB
  totalSize = 0;
  totalSizePercent = 0;
  private readonly allowedArchiveExtensions = ['.zip', '.rar'];
  private readonly allowedArchiveMime = ['application/zip', 'application/x-zip-compressed', 'application/x-rar-compressed'];

  constructor(
    private consolesApi: ConsoleService,
    private promosApi: PromoService,
    private categoriesApi: CategoryService,
    private videogamesApi: VideogameService,
    private router: Router,
    private messageService: MessageService,
    private sanitizer: DomSanitizer 
  ) {}

  ngOnInit(): void {
    this.loadConsoles();
    this.loadPromoAndCategories();
  }

  private loadConsoles() {
    this.consolesApi.findAllConsoles().subscribe({
      next: (res: ResponseData<Console[]>) => {
        const list = res?.data ?? [];
        const opts: SelectOpt[] = list.map((c) => ({ label: c.description, value: c }));
        this.consoles = [{ label: 'Seleccione Consola', value: null } as SelectOpt, ...opts];
      },
      error: () => (this.consoles = [{ label: 'Seleccione Consola', value: null } as SelectOpt])
    });
  }

  private loadPromoAndCategories() {
    this.promosApi.findAllPromos().subscribe({ next: (res) => (this.promos = res?.data ?? []) });
    this.categoriesApi.findAllCategories().subscribe({ next: (res) => (this.categories = res?.data ?? []) });
  }

  async onSingleImageUpload(event: FileUploadHandlerEvent, field: ImageField) {
    const file = event.files?.[0];
    if (!file) return;
    const payload = await this.readFilePayload(file);
    this.assignImageField(field, payload);
    this.messageService.add({
      severity: 'success',
      summary: 'Imagen cargada',
      detail: `${this.imageInputs.find((i) => i.key === field)?.label ?? 'Imagen'} actualizada.`
    });
    (event as any)?.options?.clear?.();
  }

  onSelectedFiles(event: FileSelectEvent) {
    const files = event.files ?? [];
    const invalidFiles = files.filter((f) => !this.isAllowedArchive(f));
    if (invalidFiles.length > 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Archivo no permitido',
        detail: 'Solo se aceptan archivos comprimidos (.zip o .rar).'
      });
      this.model.file = '';
      this.totalSize = 0;
      this.totalSizePercent = 0;
      this.archiveUpload?.clear();
      return;
    }
    this.totalSize = files.reduce((acc, curr) => acc + curr.size, 0);
    this.totalSizePercent = Math.min((this.totalSize / this.maxFileSize) * 100, 100);
    const primary = files[0];
    if (primary) {
      this.readFilePayload(primary).then((payload) => {
        this.model.file = payload.raw;
      });
    }
  }

  async onTemplatedUpload(event: FileUploadHandlerEvent) {
    const files = event.files ?? [];
    if (!files.length) return;
    const primary = files[0];
    const payload = await this.readFilePayload(primary);
    this.model.file = payload.raw;
    event.files.forEach((file: any) => (file.uploaded = true));
    this.messageService.add({
      severity: 'success',
      summary: 'Archivo',
      detail: `${primary.name} cargado correctamente.`
    });
    (event as any)?.options?.clear?.();
  }

  choose(event: Event, callback: (event?: Event) => void) {
    if (callback) callback(event);
  }

  uploadEvent(callback: () => void) {
    if (callback) callback();
  }

  handleTemplateClear(callback: () => void) {
    if (callback) callback();
    this.totalSize = 0;
    this.totalSizePercent = 0;
    this.model.file = '';
  }

  onRemoveTemplatingFile(event: Event, file: File, removeFileCallback: (index: number) => void, index: number) {
    if (removeFileCallback) {
      removeFileCallback(index);
    }
    this.totalSize = 0;
    this.totalSizePercent = 0;
    this.model.file = '';
  }

  formatSize(bytes: number): string {
    if (bytes === 0) {
      return '0 B';
    }
    const k = 1024;
    const dm = 2;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  getPreview(field: ImageField): SafeUrl | undefined {
   const url = this.imagePreviews[field];
   return url ? this.sanitizer.bypassSecurityTrustUrl(url) : undefined;
  }

  private assignImageField(field: ImageField, payload: { raw: string; preview: string }) {
    this.model[field] = payload.raw;
    this.imagePreviews[field] = payload.preview;
    if (field === 'image') {
      this.model.mini = payload.raw;
    }
  }

  private isAllowedArchive(file: File): boolean {
    const name = (file.name ?? '').toLowerCase();
    const type = (file.type ?? '').toLowerCase();
    return this.allowedArchiveExtensions.some((ext) => name.endsWith(ext)) || this.allowedArchiveMime.includes(type);
  }

  private readFilePayload(file: File): Promise<{ raw: string; preview: string }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const commaIdx = result.indexOf(',');
        const raw = commaIdx >= 0 ? result.substring(commaIdx + 1) : result;
        resolve({ raw, preview: result });
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  submit() {
    const pickedConsole: Console | null = Array.isArray(this.model.console)
      ? this.model.console[0] ?? null
      : this.model.console;
    const stateVal: string = Array.isArray(this.model.state) ? this.model.state[0] ?? '' : this.model.state;
    const body = {
      console: pickedConsole,
      title: this.model.title,
      description: this.model.description,
      hasDiscount: this.model.hasDiscount,
      stock: this.model.stock,
      price: this.model.price,
      state: stateVal,
      image: this.model.image,
      image2: this.model.image2,
      image3: this.model.image3,
      mini: this.model.mini,
      file: this.model.file,
      detailsPromo: this.selectedPromos ?? [],
      detailsCategories: this.selectedCategories ?? []
    };

    this.videogamesApi.create(body).subscribe({
      next: (res: ResponseData<Videogame>) => {
        const message = res?.message ?? 'Videojuego registrado correctamente.';
        this.router.navigateByUrl('/list-videogames', {
          state: {
            responseMessage: message,
            responseSeverity: 'success'
          }
        });
      }
    });
  }

}
