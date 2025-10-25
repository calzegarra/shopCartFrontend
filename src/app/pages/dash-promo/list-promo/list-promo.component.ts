import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { FloatLabelModule } from 'primeng/floatlabel';
import { FormsModule } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from '@angular/router';
import { Promo } from '../../../model/promo.model';
import { PromoService } from '../../../services/promo.service';

@Component({
  selector: 'app-list-promo',
  standalone: true,
  imports: [CommonModule, TableModule, InputTextModule, ButtonModule, IconFieldModule, InputIconModule, FloatLabelModule, FormsModule, RouterLink],
  templateUrl: './list-promo.html'
})
export class ListPromoComponent implements OnInit {
  items: Promo[] = [];
  loading = false;
  titulo: string = '';

  constructor(private catalog: PromoService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.catalog.findAllPromos().subscribe({
      next: (resp) => {
        this.items = resp?.data ?? [];
        this.loading = false;
      },
      error: () => {
        this.items = [];
        this.loading = false;
      }
    });
  }
}

