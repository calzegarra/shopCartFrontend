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
  { path: 'category-new', canActivate: [dashboardGuard], loadComponent: () => import('./pages/dash-category/new-category/new-category.component').then(m => m.NewCategoryComponent) },
  { path: 'category-edit/:id', canActivate: [dashboardGuard], loadComponent: () => import('./pages/dash-category/edit-category/edit-category.component').then(m => m.EditCategoryComponent) },
  { path: 'list-console', component: ListConsoleComponent },
  { path: 'console-new', canActivate: [dashboardGuard], loadComponent: () => import('./pages/dash-console/new-console/new-console.component').then(m => m.NewConsoleComponent) },
  { path: 'console-edit/:id', canActivate: [dashboardGuard], loadComponent: () => import('./pages/dash-console/edit-console/edit-console.component').then(m => m.EditConsoleComponent) },
  { path: 'list-promo', component: ListPromoComponent },
  { path: 'promo-new', canActivate: [dashboardGuard], loadComponent: () => import('./pages/dash-promo/new-promo/new-promo.component').then(m => m.NewPromoComponent) },
  { path: 'promo-edit/:id', canActivate: [dashboardGuard], loadComponent: () => import('./pages/dash-promo/edit-promo/edit-promo.component').then(m => m.EditPromoComponent) },
  { path: 'list-videogames', component: ListVideogamesComponent },
  { path: 'midetallecompra', loadComponent: () => import('./pages/cart-user/cart-user').then((m) => m.CartUserComponent) },
  { path: 'mis-compras', loadComponent: () => import('./pages/cart-view/cart-view.component').then((m) => m.CartViewComponent) },
  { path: 'videogame-new', canActivate: [dashboardGuard], loadComponent: () => import('./pages/dash-videogames/new-videogame/new-videogame.component').then(m => m.NewVideogameComponent) },
  { path: 'videogame-edit/:id', canActivate: [dashboardGuard], loadComponent: () => import('./pages/dash-videogames/edit-videogame/edit-videogame.component').then(m => m.EditVideogameComponent) },
  {
    path: 'future-videogames/:id',
    loadComponent: () => import('./pages/catalog-detail/catalog-detail.component').then((m) => m.CatalogDetailComponent)
  },
  { path: 'future-videogames', component: CatalogComponent },
  { path: '**', redirectTo: '' }
];
