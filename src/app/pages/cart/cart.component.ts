import { Component } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { ButtonModule } from 'primeng/button';

@Component({
  standalone: true,
  selector: 'app-cart',
  imports: [CommonModule, CurrencyPipe,ButtonModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent {
  constructor(public cart: CartService) {}
}

