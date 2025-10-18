import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { CatalogComponent } from './pages/catalog/catalog.component';
import { CartComponent } from './pages/cart/cart.component';
import { RegisterComponent } from './pages/register/register.component';
import { EmployeeDashboardComponent } from './pages/employee/employee-dashboard.component';
import { IndexDashboardComponent } from './pages/dashboard/index-dashboard.component';
import { LoginComponent } from './pages/auth/login.component';

export const routes: Routes = [
  { path: '', redirectTo: 'future-videogames', pathMatch: 'full' },
  { path: 'catalogo', component: CatalogComponent },
  { path: 'carrito', component: CartComponent },
  { path: 'registro', component: RegisterComponent },
  { path: 'empleados', component: EmployeeDashboardComponent },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: IndexDashboardComponent },
  { path: 'future-videogames', component: HomeComponent },
  { path: '**', redirectTo: '' }
];
