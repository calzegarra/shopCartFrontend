import { CommonModule, DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { RatingModule } from 'primeng/rating';
import { TabsModule } from 'primeng/tabs';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { finalize } from 'rxjs/operators';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { ReviewItem } from '../../model/review.model';

type ReviewView = ReviewItem & {
  draftScore: number;
  draftComment: string;
  editing?: boolean;
};

@Component({
  standalone: true,
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss'],
  imports: [CommonModule, FormsModule, RouterModule, TabsModule, RatingModule, ProgressSpinnerModule, ButtonModule, DatePipe]
})
export class ReviewsComponent implements OnInit {
  pending: ReviewView[] = [];
  completed: ReviewView[] = [];
  pendingLoading = false;
  completedLoading = false;
  pendingError?: string;
  completedError?: string;
  infoMessage?: string;

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private readonly cart: CartService,
    private readonly auth: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadLists();
  }

  goToLogin(): void {
    this.router.navigateByUrl('/login');
  }

  miniImage(item: ReviewItem): string {
    const src = item?.mini || '';
    if (!src) return '/assets/legacy/hero/Logo4.png';
    return src.startsWith('data:') ? src : `data:image/png;base64,${src}`;
  }

  onSave(review: ReviewView, reloadAfter = false): void {
    if (!review?.itemId) return;
    if (!review.draftScore || review.draftScore <= 0) {
      review.editing = true;
      this.infoMessage = 'Selecciona una puntuacion antes de guardar.';
      return;
    }

    this.infoMessage = undefined;
    this.cart
      .updateReview(review.itemId, { score: review.draftScore, comment: review.draftComment || '' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (res?.status) {
            if (reloadAfter) {
              this.loadLists();
            } else {
              review.score = review.draftScore;
              review.comment = review.draftComment;
              review.editing = false;
            }
          } else {
            this.infoMessage = res?.message || 'No se pudo guardar la reseña.';
          }
        },
        error: () => {
          this.infoMessage = 'No se pudo guardar la reseña.';
        }
      });
  }

  startEdit(review: ReviewView): void {
    review.editing = true;
    review.draftScore = review.score ?? 0;
    review.draftComment = review.comment ?? '';
  }

  cancelEdit(review: ReviewView): void {
    review.editing = false;
    review.draftScore = review.score ?? 0;
    review.draftComment = review.comment ?? '';
  }

  private loadLists(): void {
    const user = this.auth.user();
    if (!user?.id) {
      this.pending = [];
      this.completed = [];
      this.pendingLoading = false;
      this.completedLoading = false;
      this.pendingError = 'Debes iniciar sesión para ver tus reseñas.';
      this.completedError = 'Debes iniciar sesión para ver tus reseñas.';
      return;
    }

    this.pendingLoading = true;
    this.completedLoading = true;
    this.pendingError = undefined;
    this.completedError = undefined;

    this.cart
      .listMissingReviews(user.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.pendingLoading = false))
      )
      .subscribe({
        next: (res) => {
          if (res?.status && Array.isArray(res.data)) {
            this.pending = res.data.map(this.mapReview);
          } else {
            this.pending = [];
            this.pendingError = res?.message || 'No hay reseñas pendientes por cargar.';
          }
        },
        error: () => {
          this.pending = [];
          this.pendingError = 'No se pudieron cargar las reseñas pendientes.';
        }
      });

    this.cart
      .listCompleteReviews(user.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.completedLoading = false))
      )
      .subscribe({
        next: (res) => {
          if (res?.status && Array.isArray(res.data)) {
            this.completed = res.data.map(this.mapReview);
          } else {
            this.completed = [];
            this.completedError = res?.message || 'No hay reseñas registradas.';
          }
        },
        error: () => {
          this.completed = [];
          this.completedError = 'No se pudieron cargar las reseñas realizadas.';
        }
      });
  }

  private mapReview(item: ReviewItem): ReviewView {
    return {
      ...item,
      draftScore: item.score ?? 0,
      draftComment: item.comment ?? '',
      editing: false
    };
  }
}
