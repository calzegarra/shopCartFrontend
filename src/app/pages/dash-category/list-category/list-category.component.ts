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

