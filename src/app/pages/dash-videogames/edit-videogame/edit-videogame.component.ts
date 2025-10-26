import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

// PrimeNG
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { MultiSelectModule } from 'primeng/multiselect';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';

import { ConsoleService } from '../../../services/console.service';
import { PromoService } from '../../../services/promo.service';
import { CategoryService } from '../../../services/category.service';
import { VideogameService } from '../../../services/videogame.service';
import { Console } from '../../../model/console.model';
import { Promo } from '../../../model/promo.model';
import { Category } from '../../../model/category.model';
import { Videogame } from '../../../model/videogame.model';
import { ResponseData } from '../../../model/responseData.model';

type SelectOpt = { label: string; value: any };

@Component({
  selector: 'app-edit-videogame',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    FloatLabelModule,
    InputTextModule,
    TextareaModule,
    CheckboxModule,
    InputNumberModule,
    MultiSelectModule,
    FileUploadModule,
    ButtonModule
  ],
  templateUrl: './edit-videogame.html'
})
export class EditVideogameComponent implements OnInit {
  id!: number;

  model: any = {
    id: undefined as number | undefined,
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
    detailsPromo: [] as Promo[],
    detailsCategories: [] as Category[]
  };

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

  constructor(
    private route: ActivatedRoute,
    private consolesApi: ConsoleService,
    private promosApi: PromoService,
    private categoriesApi: CategoryService,
    private videogamesApi: VideogameService
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadConsoles();
    this.loadPromoAndCategories();
    this.loadItem();
  }

  private loadConsoles() {
    this.consolesApi.findAllConsoles().subscribe({
      next: (res: ResponseData<Console[]>) => {
        const list = res?.data ?? [];
        const opts: SelectOpt[] = list.map((c) => ({ label: c.description, value: c }));
        this.consoles = [{ label: 'Seleccione Consola', value: null } as SelectOpt, ...opts];
      }
    });
  }

  private loadPromoAndCategories() {
    this.promosApi.findAllPromos().subscribe({ next: (res) => (this.promos = res?.data ?? []) });
    this.categoriesApi.findAllCategories().subscribe({ next: (res) => (this.categories = res?.data ?? []) });
  }

  private loadItem() {
    this.videogamesApi.findById(this.id).subscribe({
      next: (res: ResponseData<Videogame>) => {
        const vg = res?.data as Videogame;
        if (!vg) return;
        this.model.id = vg.id;
        this.model.title = vg.title;
        this.model.description = vg.description;
        this.model.hasDiscount = vg.hasDiscount;
        this.model.stock = vg.stock;
        this.model.price = vg.price;
        this.model.image = vg.image || '';
        this.model.image2 = vg.image2 || '';
        this.model.image3 = vg.image3 || '';
        this.model.mini = vg.mini || '';
        this.model.console = [vg.console];
        this.model.state = [vg.state];
        this.selectedPromos = (vg as any).detailsPromo || [];
        this.selectedCategories = (vg as any).detailsCategories || [];
      }
    });
  }

  // Subir imágenes → base64
  async onUpload(event: any) {
    const files: File[] = event?.files || [];
    const bases: string[] = [];
    for (const f of files.slice(0, 4)) {
      const b64 = await this.fileToBase64(f);
      const clean = b64.split(',')[1] || b64;
      bases.push(clean);
    }
    this.model.image = bases[0] || this.model.image;
    this.model.image2 = bases[1] || this.model.image2;
    this.model.image3 = bases[2] || this.model.image3;
    this.model.mini = bases[3] || this.model.mini;
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  update() {
    const pickedConsole: Console | null = Array.isArray(this.model.console)
      ? this.model.console[0] ?? null
      : this.model.console;
    const stateVal: string = Array.isArray(this.model.state) ? this.model.state[0] ?? '' : this.model.state;

    const body: any = {
      id: this.model.id,
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
      detailsPromo: this.selectedPromos ?? [],
      detailsCategories: this.selectedCategories ?? []
    };

    this.videogamesApi.update(body).subscribe();
  }
}
