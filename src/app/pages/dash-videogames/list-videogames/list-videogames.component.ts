import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { FloatLabelModule } from 'primeng/floatlabel';
import { FormsModule } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { Router, RouterLink } from '@angular/router';
import { MessageModule } from 'primeng/message';
import { DtoCatalog } from '../../../model/catalog.model';
import { CatalogService } from '../../../services/catalog.service';

type FlashSeverity = 'success' | 'info' | 'warn' | 'error';
type FlashState = { responseMessage?: string; responseSeverity?: FlashSeverity };

@Component({
  selector: 'app-list-videogames',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    InputTextModule,
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    FloatLabelModule,
    FormsModule,
    RouterLink,
    MessageModule
  ],
  templateUrl: './list-videogames.html'
})
export class ListVideogamesComponent implements OnInit {
  items: DtoCatalog[] = [];
  loading = false;
  titulo: string = '';
  flashMessage: string | null = null;
  flashSeverity: FlashSeverity = 'success';

  constructor(
    private catalog: CatalogService,
    private router: Router
  ) {
    const nav = this.router.getCurrentNavigation();
    const extrasState = (nav?.extras?.state ?? {}) as FlashState;
    if (extrasState.responseMessage) {
      this.flashMessage = extrasState.responseMessage;
      this.flashSeverity = extrasState.responseSeverity ?? 'success';
    }
  }

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
