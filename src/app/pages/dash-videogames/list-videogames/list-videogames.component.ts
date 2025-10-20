import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { FloatLabelModule } from 'primeng/floatlabel';
import { FormsModule } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DtoCatalog } from '../../../model/catalog.model';
import { CatalogService } from '../../../services/catalog.service';

@Component({
  selector: 'app-list-videogames',
  standalone: true,
  imports: [CommonModule, TableModule, InputTextModule, ButtonModule, IconFieldModule, InputIconModule, FloatLabelModule, FormsModule],
  templateUrl: './list-videogames.html'
})
export class ListVideogamesComponent implements OnInit {
  items: DtoCatalog[] = [];
  loading = false;
  titulo: string = '';

  constructor(private catalog: CatalogService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.catalog.findCatalog().subscribe({
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

