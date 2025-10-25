import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { ImageModule } from 'primeng/image';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CartService } from '../../services/cart.service';
import { CatalogService } from '../../services/catalog.service';
import { DtoCatalog } from '../../model/catalog.model';
import { Videogame } from '../../model/videogame.model';

type GameVM = { id: string; title: string; price: number; cover: string; hasDiscount: boolean };

@Component({
  standalone: true,
  selector: 'app-catalog',
  imports: [CommonModule, CurrencyPipe, ButtonModule, DialogModule, TagModule, ImageModule, ToastModule],
  providers: [MessageService],
  templateUrl: './catalog.component.html'
})
export class CatalogComponent implements OnInit {
  constructor(private cart: CartService, private catalog: CatalogService, private messages: MessageService) {}

  games = signal<GameVM[]>([]);
  visible = false;
  selected?: Videogame;
  loadingDetails = false;

  ngOnInit(): void {
    this.catalog.findCatalog().subscribe({
      next: (resp) => {
        const list = (resp?.data ?? []).map(this.mapDtoToVm);
        this.games.set(list);
      },
      error: (err) => {
        console.error('Error loading catalog', err);
        this.games.set([]);
      }
    });
  }

  private mapDtoToVm(dto: DtoCatalog): GameVM {
    const imgSrc = dto.mini ? `data:image/jpeg;base64,${dto.mini}` : '';
    return {
      id: String(dto.id),
      title: dto.title,
      price: Number(dto.price),
      cover: imgSrc,
      hasDiscount: Number(dto.hasDiscount) === 1
    };
  }

  openDetails(item: GameVM) {
    const id = Number(item.id);
    if (!id) return;
    this.loadingDetails = true;
    this.catalog.findById(id).subscribe({
      next: (resp) => {
        this.selected = resp?.data as Videogame;
        this.visible = true;
        this.loadingDetails = false;
      },
      error: (err) => {
        console.error('Error loading details', err);
        this.loadingDetails = false;
      }
    });
  }

  closeDialog() {
    this.visible = false;
  }

  addSelectedToCart() {
    const sg = this.selected;
    if (!sg) return;
    this.cart.add({ id: String(sg.id), title: sg.title, price: Number(sg.price) });
    this.messages.add({ severity: 'success', summary: 'Agregado', detail: `${sg.title} agregado al carrito` });
    this.visible = false;
  }

  // Compatibilidad si se quiere agregar desde la tarjeta del catálogo
  addToCart(item: GameVM) {
    if (!item) return;
    this.cart.add({ id: item.id, title: item.title, price: item.price });
    this.messages.add({ severity: 'success', summary: 'Agregado', detail: `${item.title} agregado al carrito` });
  }
}

