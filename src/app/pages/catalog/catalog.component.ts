import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CartService } from '../../services/cart.service';
import { CatalogService } from '../../services/catalog.service';
import { DtoCatalog } from '../../model/catalog.model';

type GameVM = { id: string; title: string; price: number; cover: string; hasDiscount: boolean };

@Component({
  standalone: true,
  selector: 'app-catalog',
  imports: [CommonModule, CurrencyPipe, ButtonModule],
  templateUrl: './catalog.component.html'
})
export class CatalogComponent implements OnInit {
  constructor(private cart: CartService, private catalog: CatalogService) {}

  games = signal<GameVM[]>([]);

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

  addToCart(item: GameVM) {
    this.cart.add({ id: item.id, title: item.title, price: item.price });
  }
}

