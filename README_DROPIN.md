# Shell funcional Angular (standalone)

Incluye:
- `src/main.ts` con `bootstrapApplication`
- `src/app/app.config.ts` con `provideRouter(routes)`
- `src/app/app.ts` + `app.html` + `app.scss`
- Rutas y 4 pantallas (Home, Catálogo, Carrito, Registro)
- `CartService` con Signals (agrega desde Catálogo y se refleja en Carrito)

## Cómo integrarlo en tu repo
1) **Haz backup** de tu `src/` actual.
2) Copia lo de este zip sobre tu proyecto, o reemplaza **estos archivos** puntuales:
   - `src/main.ts`
   - `src/app/app.config.ts`
   - `src/app/app.ts`
   - `src/app/app.html`
   - `src/app/app.scss`
   - `src/app/app.routes.ts`
   - `src/app/pages/**`
   - `src/app/services/cart.service.ts`
   - `src/assets/*` (opcional)
3) `npm install` (si necesario) y `ng serve`.
4) Rutas: `/`, `/catalogo`, `/carrito`, `/registro`.

> No usa PrimeNG ni Tailwind para evitar errores de dependencias.
> Probado con Angular 17–20 (standalone).
