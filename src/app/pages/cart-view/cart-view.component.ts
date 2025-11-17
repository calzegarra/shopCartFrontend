import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';
import { DtoMyCart, CartDetail, CartVideogameDetail } from '../../model/cart.model';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-cart-view',
  standalone: true,
  imports: [CommonModule, AccordionModule, ButtonModule],
  templateUrl: './cart-view.component.html',
  styleUrls: ['./cart-view.component.scss']
})
export class CartViewComponent implements OnInit {
  readonly purchases = signal<DtoMyCart[]>([]);
  readonly detailCache = signal<Record<number, CartDetail>>({});
  readonly loadingDetails = signal<Record<number, boolean>>({});
  readonly detailErrors = signal<Record<number, string>>({});

  readonly isLoadingList = signal(true);
  readonly listError = signal<string | null>(null);

  constructor(
    private cartService: CartService,
    private auth: AuthService,
    private destroyRef: DestroyRef
  ) {}
  activePanels: string[] = [];
  ngOnInit(): void {
    this.loadPurchases();
  }

  get hasPurchases(): boolean {
    return this.purchases().length > 0;
  }

  trackByCart(_index: number, item: DtoMyCart) {
    return item.cartId;
  }

  trackByGame(_index: number, item: CartVideogameDetail) {
    return item.id;
  }

  cartDetail(cartId: number): CartDetail | null {
    return this.detailCache()[cartId] ?? null;
  }

  isDetailLoading(cartId: number): boolean {
    return !!this.loadingDetails()[cartId];
  }

  detailError(cartId: number): string | null {
    return this.detailErrors()[cartId] ?? null;
  }

  onAccordionOpen(event: any) {
    const cartId = event?.panel?.value;
    console.log('dYY� Panel abierto, cartId:', cartId, event);

    if (!cartId) {
      console.warn('�s��,? No se encontrA3 cartId en el evento');
      return;
    }

    if (this.isDetailLoading(cartId) || this.cartDetail(cartId)) {
      console.log('�?-�,? Detalle ya cargado o en proceso para cartId', cartId);
      return;
    }

    this.fetchDetail(Number(cartId));
  }

  private onTabOpen(purchase: DtoMyCart) {
    if (this.isDetailLoading(purchase.cartId)) {
      return;
    }
    this.fetchDetail(purchase.cartId);
  }

  downloadFile(game: CartVideogameDetail) {
    if (!game?.file) {
      window.alert('No hay archivo disponible para descargar.');
      return;
    }
    const blob = this.base64ToBlob(game.file, 'application/zip');
    const url = URL.createObjectURL(blob);
    const normalizedTitle = game.title ? game.title.replace(/[^a-z0-9]+/gi, '_') : 'archivo';
    const link = document.createElement('a');
    link.href = url;
    link.download = `${normalizedTitle}.zip`;
    link.click();
    URL.revokeObjectURL(url);
  }

  requestRefund(game: CartVideogameDetail) {
    window.alert(`Funcionalidad en construccion: podras solicitar la devolucion de "${game.title}" desde aqui.`);
  }

  gameImage(game: CartVideogameDetail): string {
    if (!game?.mini) {
      return '/assets/legacy/hero/Logo4.png';
    }
    return game.mini.startsWith('data:') ? game.mini : `data:image/png;base64,${game.mini}`;
  }

  private loadPurchases() {
    const user = this.auth.user();
    if (!user?.id) {
      this.isLoadingList.set(false);
      this.listError.set('Debes iniciar sesion para consultar tus compras.');
      return;
    }

    this.cartService
      .findMyPurchases(user.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoadingList.set(false))
      )
      .subscribe({
        next: (response) => {
          if (response?.status && Array.isArray(response.data)) {
            this.purchases.set(response.data);
            this.listError.set(null);
          } else {
            this.purchases.set([]);
            this.listError.set(response?.message || 'No fue posible recuperar tus compras.');
          }
        },
        error: () => {
          this.purchases.set([]);
          this.listError.set('No se pudo conectar con el servicio de compras. Intenta nuevamente.');
        }
      });
  }

  private fetchDetail(cartId: number) {
    this.setLoadingDetail(cartId, true);
    this.cartService
      .findCartById(cartId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.setLoadingDetail(cartId, false))
      )
      .subscribe({
        next: (response) => {
          console.log('dY"� Respuesta del detalle del carrito', cartId, response);

          if (response?.status && response.data) {
            this.detailCache.update((curr) => {
              const copy = { ...curr };
              copy[Number(cartId)] = response.data as CartDetail;
              console.log('�o. detailCache actualizado:', copy);
              return copy;
            });

            this.detailErrors.update((curr) => {
              const { [cartId]: _, ...rest } = curr;
              return rest;
            });
          } else {
            this.detailErrors.update((curr) => ({
              ...curr,
              [cartId]: response?.message || 'No hay detalle disponible.'
            }));
          }
        },
        error: () => {
          this.detailErrors.update((curr) => ({ ...curr, [cartId]: 'No se pudo recuperar el detalle de la compra.' }));
        }
      });
  }

  private setLoadingDetail(cartId: number, value: boolean) {
    this.loadingDetails.update((curr) => ({ ...curr, [cartId]: value }));
  }

  onAccordionValueChange(values: string | number | (string | number)[] | null | undefined) {
    console.log('dYY� valueChange detectado:', values);

    if (!values) return; // evita null o undefined

    // Normaliza a arreglo
    const activeValues = Array.isArray(values) ? values : [values];
    const lastValue = activeValues[activeValues.length - 1];
    const cartId = Number(lastValue);

    console.log('dYY� Se abriA3 el panel con cartId:', cartId);

    if (this.isDetailLoading(cartId) || this.cartDetail(cartId)) {
      console.log('�?-�,? Detalle ya cargado o en proceso para cartId', cartId);
      return;
    }

    this.fetchDetail(cartId);
  }

  private base64ToBlob(base64: string, contentType: string): Blob {
    const clean = base64.includes(',') ? base64.substring(base64.indexOf(',') + 1) : base64;
    const byteChars = atob(clean);
    const byteNumbers = new Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) {
      byteNumbers[i] = byteChars.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
  }
}
