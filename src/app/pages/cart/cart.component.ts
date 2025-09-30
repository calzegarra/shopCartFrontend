import { Component } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { CartService } from '../../services/cart.service';

@Component({
  standalone: true,
  selector: 'app-cart',
  imports: [CommonModule, CurrencyPipe],
  template: `
    <h2>Carrito</h2>
    @if ((cart.items()||[]).length === 0) {
      <p>Tu carrito está vacío.</p>
    } @else {
      <ul style="list-style:none; padding:0; margin:1rem 0; display:flex; flex-direction:column; gap:.5rem;">
        @for (it of cart.items(); track it.id) {
          <li class="card" style="padding:.6rem .8rem; display:grid; grid-template-columns:1fr auto auto auto; gap:1rem; align-items:center;">
            <span>{{ it.title }}</span>
            <span>x{{ it.qty }}</span>
            <span>{{ it.price * it.qty | currency }}</span>
            <button class="btn" (click)="cart.remove(it.id)">Quitar</button>
          </li>
        }
      </ul>
      <div style="text-align:right; font-weight:600;">Total: {{ cart.total() | currency }}</div>
    }
  `
})
export class CartComponent {
  constructor(public cart: CartService) {}
}
