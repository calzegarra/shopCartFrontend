import { Component, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CartService } from '../../services/cart.service';

type Item = { id: string; title: string; price: number; cover: string; discount: number };

@Component({
  standalone: true,
  selector: 'app-catalog',
  imports: [CommonModule, CurrencyPipe, ButtonModule],
  templateUrl: './catalog.component.html'
})
export class CatalogComponent {
  constructor(private cart: CartService) {}
  games = signal<Item[]>([
    { id:'eldenring', title: 'Elden Ring', price: 59.99, cover: '/assets/eldenring.jpg', discount: 0.20 },
    { id:'hades2', title: 'Hades II', price: 39.99, cover: '/assets/hades2.jpg' , discount: 0.40},
    { id:'celeste', title: 'Celeste', price: 14.99, cover: '/assets/celeste.jpg', discount: 0.30 }
  ]);
  addToCart(item: Item) { this.cart.add({ id:item.id, title:item.title, price:item.price }); }
}

