import { Routes } from '@angular/router';
import { CatalogComponent } from './pages/catalog/catalog.component';
import { ListVideogamesComponent } from './pages/dash-videogames/list-videogames/list-videogames.component'; 
import { ListCategoryComponent } from './pages/dash-category/list-category/list-category.component'; 
import { ListConsoleComponent } from './pages/dash-console/list-console/list-console.component'; 
import { ListPromoComponent } from './pages/dash-promo/list-promo/list-promo.component'; 
import { CartComponent } from './pages/cart/cart.component';
import { EmployeeDashboardComponent } from './pages/employee/employee-dashboard.component';
import { IndexDashboardComponent } from './pages/dashboard/index-dashboard.component';
import { LoginComponent } from './pages/auth/login.component';
import { dashboardGuard } from './guards/dashboard.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'future-videogames', pathMatch: 'full' },
  { path: 'carrito', component: CartComponent },
  { path: 'registro', loadComponent: () => import('./pages/user/new-user/new-user').then(m => m.NewUserComponent) },
  { path: 'perfil', loadComponent: () => import('./pages/user/edit-user/edit-user').then(m => m.EditUserComponent) },
  { path: 'empleados', component: EmployeeDashboardComponent },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: IndexDashboardComponent, canActivate: [dashboardGuard] },
  { path: 'list-category', component: ListCategoryComponent },
  { path: 'list-console', component: ListConsoleComponent },
  { path: 'list-promo', component: ListPromoComponent },
  { path: 'list-videogames', component: ListVideogamesComponent },
  { path: 'videogame-create', canActivate: [dashboardGuard], loadComponent: () => import('./pages/dash-videogames/create-videogame/create-videogame.component').then(m => m.CreateVideogameComponent) },
  { path: 'videogame-edit/:id', canActivate: [dashboardGuard], loadComponent: () => import('./pages/dash-videogames/edit-videogame/edit-videogame.component').then(m => m.EditVideogameComponent) },
  { path: 'future-videogames', component: CatalogComponent },
  { path: '**', redirectTo: '' }
];
