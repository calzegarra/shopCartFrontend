import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { FloatLabelModule } from 'primeng/floatlabel';
import { FormsModule } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { Console } from '../../../model/console.model';
import { RouterLink } from '@angular/router';
import { ConsoleService } from '../../../services/console.service';

@Component({
  selector: 'app-list-console',
  standalone: true,
  imports: [CommonModule, TableModule, InputTextModule, ButtonModule, IconFieldModule, InputIconModule, FloatLabelModule, FormsModule, RouterLink],
  templateUrl: './list-console.html'
})
export class ListConsoleComponent implements OnInit {
  items: Console[] = [];
  loading = false;
  titulo: string = '';

  constructor(private catalog: ConsoleService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.catalog.findAllConsoles().subscribe({
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
