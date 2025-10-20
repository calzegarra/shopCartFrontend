import { Component, HostBinding } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ChatWidgetComponent } from './components/chat-widget/chat-widget.component';
import { SidebarNavComponent } from './components/sidebar-nav/sidebar-nav.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ChatWidgetComponent, SidebarNavComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent {
  readonly year = new Date().getFullYear();


  @HostBinding('attr.data-theme') get theme() { return null; } // no aplica aquí
  get root() { return document  .documentElement; }

  currentTheme = (localStorage.getItem('theme') ?? 'Lara Light Indigo');

  ngOnInit() {
    this.root.setAttribute('data-theme', this.currentTheme);
    // Toggle PrimeNG dark mode class based on our theme
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
}
