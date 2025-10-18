import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PanelModule } from 'primeng/panel';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-index-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, PanelModule, CardModule, ButtonModule],
  templateUrl: './index-dashboard.component.html',
  styleUrls: ['./index-dashboard.component.scss']
})
export class IndexDashboardComponent {}

