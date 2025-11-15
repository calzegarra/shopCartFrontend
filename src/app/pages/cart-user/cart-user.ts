import { Component, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { DtoMyProducts, DtoPurchases } from '../../model/purchase.model';

@Component({
  selector: 'app-cart-user-detail',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './cart-user.html',
  styleUrls: ['./cart-user.scss']
})
export class CartUserComponent {
  purchase = computed(() => this.cart.lastPurchase());

  constructor(
    private cart: CartService,
    private router: Router
  ) {}

  get hasPurchase(): boolean {
    return !!this.purchase();
  }

  backToStore() {
    this.router.navigateByUrl('/future-videogames');
  }

  imageSrc(item: DtoMyProducts): string {
    if (!item?.mini) return '/assets/legacy/hero/Logo4.png';
    return item.mini.startsWith('data:') ? item.mini : `data:image/png;base64,${item.mini}`;
  }

  formatDiscount(item: DtoMyProducts): number {
    return Math.round((item.unitDiscount ?? 0) * 100);
  }

  trackByTitle(_index: number, item: DtoMyProducts) {
    return item.title;
  }
}
