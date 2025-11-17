import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, DestroyRef, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { ButtonModule } from 'primeng/button';
import { ImageModule } from 'primeng/image';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AccordionModule } from 'primeng/accordion';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { RatingModule } from 'primeng/rating';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CatalogService } from '../../services/catalog.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Videogame } from '../../model/videogame.model';
import { UserComment } from '../../model/comment.model';
import { DtoCatalog } from '../../model/catalog.model';
import { CarouselModule } from 'primeng/carousel';

@Component({
  standalone: true,
  selector: 'app-catalog-detail',
  templateUrl: './catalog-detail.component.html',
  styleUrls: ['./catalog-detail.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CurrencyPipe,
    ButtonModule,
    ImageModule,
    TagModule,
    ToastModule,
    AccordionModule,
    AvatarModule,
    BadgeModule,
    RatingModule,
    ProgressSpinnerModule,
    CarouselModule
  ],
  providers: [MessageService]
})
export class CatalogDetailComponent {
  game?: Videogame;
  loading = true;
  errorMessage?: string;
  comments: UserComment[] = [];
  commentsLoading = false;
  commentsError?: string;
  recommendations: DtoCatalog[] = [];
  recommendationsLoading = false;
  recommendationsError?: string;
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly catalog: CatalogService,
    private readonly auth: AuthService,
    private readonly cart: CartService,
    private readonly messages: MessageService
  ) {
    this.listenForSelection();
  }

  private listenForSelection(): void {
    this.route.paramMap
      .pipe(
        map((params) => Number(params.get('id'))),
        tap(() => {
          this.loading = true;
          this.errorMessage = undefined;
          this.game = undefined;
          this.comments = [];
          this.commentsError = undefined;
          this.commentsLoading = false;
          this.recommendations = [];
          this.recommendationsError = undefined;
          this.recommendationsLoading = false;
        }),
        switchMap((id) => {
          if (!id) {
            this.loading = false;
            this.errorMessage = 'Identificador de videojuego invalido.';
            return EMPTY;
          }
          this.loadComments(id);
          return this.catalog.findById(id);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (resp) => {
          this.game = resp?.data ?? undefined;
          this.loading = false;
          if (!this.game) {
            this.errorMessage = 'No se encontro informacion del videojuego solicitado.';
            this.recommendations = [];
          } else {
            this.errorMessage = undefined;
            this.loadRecommendations(this.game);
          }
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err?.error?.message ?? 'No se pudo cargar el detalle del videojuego.';
          this.recommendations = [];
          this.recommendationsError = undefined;
        }
      });
  }

  private loadComments(gameId: number): void {
    this.commentsLoading = true;
    this.commentsError = undefined;
    this.comments = [];
    this.cart
      .listUserReviews(gameId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.comments = res?.data ?? [];
          this.commentsLoading = false;
        },
        error: (err) => {
          this.commentsLoading = false;
          this.comments = [];
          this.commentsError = err?.error?.message ?? 'No se pudieron cargar los comentarios.';
        }
      });
  }

  private loadRecommendations(game: Videogame): void {
    const categories = (game.detailsCategories ?? [])
      .map((c) => c?.description)
      .filter((d): d is string => !!d);

    this.recommendationsLoading = true;
    this.recommendationsError = undefined;
    this.recommendations = [];
    console.log('POST findRecommendations', categories);

    this.catalog
      .findRecommendations(categories)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.recommendations = res?.data ?? [];
          this.recommendationsLoading = false;
        },
        error: (err) => {
          this.recommendationsLoading = false;
          this.recommendations = [];
          this.recommendationsError = err?.error?.message ?? 'No se pudieron cargar las recomendaciones.';
        }
      });
  }

  addToCart(game?: Videogame): void {
    if (!game) return;
    const profile = this.auth.user();
    if (!profile) {
      this.router.navigateByUrl('/login');
      return;
    }
    this.cart.add({ id: String(game.id), title: game.title, price: Number(game.price) });
    this.messages.add({
      severity: 'success',
      summary: 'Agregado',
      detail: `${game.title} agregado al carrito`
    });
  }

  trackByCategory(index: number, item: any) {
    return item.id;
  }

  mainImage(game?: Videogame): string {
    if (!game) return '';
    const source = game.image || game.image2 || game.image3 || '';
    return this.normalizeImage(source);
  }

  secondaryImages(game?: Videogame): string[] {
    if (!game) return [];
    const sources = [game.image, game.image2, game.image3].filter((img) => !!img) as string[];
    return sources.map((src) => this.normalizeImage(src));
  }

  avatarSource(comment: UserComment): string {
    const source = comment.avatar || '';
    if (!source) return '';
    return source.startsWith('data:') ? source : `data:image/png;base64,${source}`;
  }

  miniImage(item: DtoCatalog): string {
    const source = item?.mini || '';
    if (!source) return '';
    return source.startsWith('data:') ? source : `data:image/png;base64,${source}`;
  }

  openGameInNewTab(id?: number): void {
    if (!id) return;
    this.router.navigate(['/future-videogames', id]);
  }

  private normalizeImage(source?: string | null): string {
    if (!source) return '';
    return source.startsWith('data:') ? source : `data:image/jpeg;base64,${source}`;
  }
}
