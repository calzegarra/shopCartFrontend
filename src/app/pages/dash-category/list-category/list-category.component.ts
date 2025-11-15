import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { FloatLabelModule } from 'primeng/floatlabel';
import { FormsModule } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from '@angular/router'
import { Category } from '../../../model/category.model';
import { CategoryService } from '../../../services/category.service';

@Component({
  selector: 'app-list-category',
  standalone: true,
  imports: [CommonModule, TableModule, InputTextModule, ButtonModule, IconFieldModule, InputIconModule, FloatLabelModule, FormsModule,RouterLink],
  templateUrl: './list-category.html'
})
export class ListCategoryComponent implements OnInit {
  items: Category[] = [];
   private allItems: Category[] = [];
  loading = false;
  titulo: string = '';

  constructor(private catalog: CategoryService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.catalog.findAllCategories().subscribe({
      next: (resp) => {
        this.allItems = resp?.data ?? [];
        this.applyFilter(this.titulo);
        this.loading = false;
      },
      error: () => {
        this.allItems = [];
        this.applyFilter(this.titulo);
        this.loading = false;
      }
    });
  }

    applyFilter(query: string = ''): void {
    this.titulo = query;
    const normalized = (query ?? '').trim().toLowerCase();
    if (!normalized) {
      this.items = [...this.allItems];
      return;
    }
    const terms = normalized.split(/\s+/).filter(Boolean);
    this.items = this.allItems.filter((category) => {
      const description = (category.description ?? '').toLowerCase();
      return terms.every((term) => description.includes(term));
    });
  }
}

