import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { ButtonModule } from 'primeng/button';
import { ImageModule } from 'primeng/image';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CatalogService } from '../../services/catalog.service';
import { CartService } from '../../services/cart.service';
import { Videogame } from '../../model/videogame.model';

@Component({
  standalone: true,
  selector: 'app-catalog-detail',
  templateUrl: './catalog-detail.component.html',
  styleUrls: ['./catalog-detail.component.scss'],
  imports: [CommonModule, RouterModule, CurrencyPipe, ButtonModule, ImageModule, TagModule, ToastModule],
  providers: [MessageService]
})
export class CatalogDetailComponent {
  game?: Videogame;
  loading = true;
  errorMessage?: string;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly catalog: CatalogService,
    private readonly cart: CartService,
    private readonly messages: MessageService
  ) {
    this.listenForSelection();
  }

  private listenForSelection(): void {
    this.route.paramMap
      .pipe(
        map((params) => Number(params.get('id'))),
        tap(() => {
          this.loading = true;
          this.errorMessage = undefined;
          this.game = undefined;
        }),
        switchMap((id) => {
          if (!id) {
            this.loading = false;
            this.errorMessage = 'Identificador de videojuego inválido.';
            return EMPTY;
          }
          return this.catalog.findById(id);
        }),
        takeUntilDestroyed()
      )
      .subscribe({
        next: (resp) => {
          this.game = resp?.data ?? undefined;
          this.loading = false;
          if (!this.game) {
            this.errorMessage = 'No se encontró información del videojuego solicitado.';
          }
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err?.error?.message ?? 'No se pudo cargar el detalle del videojuego.';
        }
      });
  }

  addToCart(game?: Videogame): void {
    if (!game) return;
    this.cart.add({ id: String(game.id), title: game.title, price: Number(game.price) });
    this.messages.add({
      severity: 'success',
      summary: 'Agregado',
      detail: `${game.title} agregado al carrito`
    });
  }

  trackByCategory(index: number, item: any) {
  return item.id;
}

  mainImage(game?: Videogame): string {
    if (!game) return '';
    const source =  game.image || game.image2 || game.image3 || '';
    return this.normalizeImage(source);
  }

  secondaryImages(game?: Videogame): string[] {
    if (!game) return [];
    const sources = [game.image, game.image2, game.image3].filter((img) => !!img) as string[];
    return sources.map((src) => this.normalizeImage(src));
  }

  private normalizeImage(source?: string | null): string {
    if (!source) return '';
    return source.startsWith('data:') ? source : `data:image/jpeg;base64,${source}`;
  }
}
