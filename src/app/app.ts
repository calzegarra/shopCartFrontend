import { Component, HostBinding, HostListener, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
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
  constructor(private cart: CartService, public auth: AuthService) {}

  // Total de Ã­tems en el carrito (suma de qty)
  readonly cartCount = computed(() => this.cart.items().reduce((n, it) => n + it.qty, 0));


  @HostBinding('attr.data-theme') get theme() { return null; } // no aplica aquÃ­
  get root() { return document  .documentElement; }

  currentTheme = (localStorage.getItem('theme') ?? 'Lara Light Indigo');
  menuItems: MenuItem[] = []; // ✅ agrega esta línea


  ngOnInit() {
    this.root.setAttribute('data-theme', this.currentTheme);
    if (this.currentTheme === 'light') {
      this.root.classList.remove('p-dark');
    } else {
      this.root.classList.add('p-dark');
    }

    const isClient = this.auth.role === 'CLIENTE';
    this.menuItems = [
      { label: 'Mi perfil', icon: 'pi pi-user', command: () => console.log('Perfil') },
    ];

    if (isClient) {
      this.menuItems.push(
        { label: 'Mis compras', icon: 'pi pi-shopping-bag', command: () => console.log('Compras') },
        { label: 'Favoritos', icon: 'pi pi-heart', command: () => console.log('Favoritos') },
        { label: 'Mis reseñas', icon: 'pi pi-star', command: () => console.log('Reseñas') },
      );
    }

    this.menuItems.push({ separator: true });

    this.menuItems.push({
      label: 'Cerrar sesión',
      icon: 'pi pi-sign-out',
      command: () => {
        console.log('🟢 Ejecutando logout...');
        this.menuOpen = false;
        this.auth.logout();
      }
    });
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
    return u ? `${u.name}` : '';
  }
  avatarLabel() {
    const u = this.auth.user();
    const base = u?.name || u?.username || 'U';
    return base.charAt(0).toUpperCase();
  }


  
}

