import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [RouterLink],
// home.component.ts (solo el template)
template: `
<section class="hero">
  <img class="hero-img" src="/assets/banner.jpg" alt="Banner" loading="eager">

  <!-- LOGO sobre el banner -->
  <img
    class="hero-logo"
    src="/assets/legacy/hero/Logo3.png"
    alt="Future"
    width="540" height="160"
  />

  <!-- CTA (opcional) -->
  <div class="hero-overlay-cta">

    <p style="font-family: 'Press Start 2P', cursive;color: black;">Explora nuevos mundos virtuales</p>
    <a routerLink="/catalogo" class="btn primary">Ver catálogo</a>
  </div>
</section>
`,
styles: [`
  .hero { position: relative; border-radius: 12px; overflow: hidden; }
  .hero-img { display:block; width:100%; height:360px; object-fit:cover; filter:contrast(.95) saturate(.9); }

  /* Logo centrado hacia la derecha */
  .hero-logo {
    position: absolute;
        background-color: rgba(255, 255, 255, 0.3); /* Color de fondo con transparencia */
    backdrop-filter: blur(10px); /* Efecto de desenfoque */
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%); /* centra desde su punto */
    max-width: 42vw;   /* que sea responsivo */
    width: 540px;      /* tamaño ideal desktop */
    height: auto;
    pointer-events: none; /* no bloquea clicks del CTA */
    filter: drop-shadow(0 8px 28px rgba(0, 200, 255, .25));
  }

  /* CTA encima, sin tapar el logo */
  .hero-overlay-cta{
    position:absolute; inset:0;
    display:flex; flex-direction:column; align-items:center; justify-content:flex-end;
    gap:.5rem; padding:1.25rem 1rem 1.75rem;
    color:#fff; text-align:center;
    background: linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,.45) 100%);
  }

  @media (max-width: 1024px) {
    .hero-img { height:44vh; }
    .hero-logo { left:55%; max-width:56vw; width:420px; }
  }
  @media (max-width: 640px) {
    .hero-logo { left:50%; max-width:72vw; width:340px; }
  }
.section_banner {
    background-color: rgba(255, 255, 255, 0.3); /* Color de fondo con transparencia */
    backdrop-filter: blur(10px); /* Efecto de desenfoque */
    max-width: 900px;
    margin: 0 auto;
    padding: 30px;
    text-align: center;
}
`]


})
export class HomeComponent {}
