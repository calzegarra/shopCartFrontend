import { Component, HostBinding } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent {
  readonly year = new Date().getFullYear();

  // Mantén el tema en el atributo de <html> (root)
  @HostBinding('attr.data-theme') get theme() { return null; } // no aplica aquí
  get root() { return document.documentElement; }

  currentTheme = (localStorage.getItem('theme') ?? 'neon');

  ngOnInit() {
    this.root.setAttribute('data-theme', this.currentTheme);
  }

  setTheme(next: 'neon'|'sunset'|'arcade'|'light') {
    this.currentTheme = next;
    this.root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  }
}
