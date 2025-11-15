import { Component, HostBinding, HostListener, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { ChatWidgetComponent } from './components/chat-widget/chat-widget.component';
import { BadgeModule } from 'primeng/badge';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { AvatarModule } from 'primeng/avatar';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { RippleModule } from 'primeng/ripple';
import { MenuItem } from 'primeng/api';
import { AuthService } from './services/auth.service';
import { CartService } from './services/cart.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ChatWidgetComponent, BadgeModule, OverlayBadgeModule, AvatarModule, TieredMenuModule, RippleModule],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent {
  readonly year = new Date().getFullYear();
  constructor(private cart: CartService, public auth: AuthService, private router: Router) {}

  // Total de items en el carrito (suma de qty)
  readonly cartCount = computed(() => this.cart.items().reduce((n, it) => n + it.qty, 0));


  @HostBinding('attr.data-theme') get theme() { return null; } // no aplica aqui
  get root() { return document  .documentElement; }

  currentTheme = (localStorage.getItem('theme') ?? 'Lara Light Indigo');
  menuItems: MenuItem[] = [];
  private readonly syncMenuItems = effect(() => {
    const user = this.auth.user();
    const role = (user?.role?.description || '').toUpperCase();
    this.menuItems = this.createMenuItems(role);
    if (!user) {
      this.menuOpen = false;
    }
  });

  ngOnInit() {
    this.root.setAttribute('data-theme', this.currentTheme);
    if (this.currentTheme === 'light') {
      this.root.classList.remove('p-dark');
    } else {
      this.root.classList.add('p-dark');
    }
  }

  setTheme(next: 'neon'|'sunset'|'arcade'|'light') {
    this.currentTheme = next;
    this.root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    if (next === 'light') {
      this.root.classList.remove('p-dark');
    } else {
      this.root.classList.add('p-dark');
    }
  }

  menuOpen = false;
  toggleMenu(event: MouseEvent) {
    event.stopPropagation();
    this.menuOpen = !this.menuOpen;
  }
  @HostListener('document:click')
  closeOnOutsideClick() {
    this.menuOpen = false;
  }
  get userName() {
    const u = this.auth.user();
    return u ? `${u.username}` : '';
  }
  avatarLabel() {
    const u = this.auth.user();
    const base = u?.name || u?.username || 'U';
    return base.charAt(0).toUpperCase();
  }

  isClientUser(): boolean {
    const role = (this.auth.user()?.role?.description || '').toUpperCase();
    return role === 'CLIENTE';
  }

  private createMenuItems(role: string): MenuItem[] {
    const isClient = role === 'CLIENTE';
    const items: MenuItem[] = [
      { label: 'Mi perfil', icon: 'pi pi-user', command: () => this.goToProfile() },
    ];

    if (isClient) {
      items.push(
        { label: 'Mis compras', icon: 'pi pi-shopping-bag', command: () => this.goToMyPurchases() },
        { label: 'Favoritos', icon: 'pi pi-heart', command: () => console.log('Favoritos') },
        { label: 'Mis reseñas', icon: 'pi pi-star', command: () => console.log('Resenas') },
      );
    }else{
        items.push(
        { label: 'Dashboard', icon: 'pi pi-sitemap', command: () => this.goToDashboard() },
        { label: 'Pagina Principal', icon: 'pi pi-discord', command: () => this.goToMainPage() },
      );
    }

    items.push({ separator: true });
    items.push({
      label: 'Cerrar sesion',
      icon: 'pi pi-sign-out',
      command: () => {
        console.log('Ejecutando logout...');
        this.menuOpen = false;
        this.auth.logout();
      }
    });

    return items;
  }

  private goToProfile() {
    this.menuOpen = false;
    this.router.navigateByUrl('/perfil');
  }

  private goToDashboard() {
    this.menuOpen = false;
    this.router.navigateByUrl('/dashboard');
  }

  private goToMainPage() {
    this.menuOpen = false;
    this.router.navigateByUrl('/future-videogames');
  }

  private goToMyPurchases() {
    this.menuOpen = false;
    this.router.navigateByUrl('/mis-compras');
  }


}
