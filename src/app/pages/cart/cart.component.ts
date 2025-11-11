import { Component } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { AuthService, UserProfile } from '../../services/auth.service';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { User } from '../../model/user.model';

@Component({
  standalone: true,
  selector: 'app-cart',
  imports: [CommonModule, CurrencyPipe, ButtonModule, DialogModule, ToastModule],
  providers: [MessageService],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent {
  authDialogVisible = false;
  loading = false;

  constructor(
    public cart: CartService,
    private auth: AuthService,
    private router: Router,
    private messages: MessageService
  ) {}

  get hasItems(): boolean {
    return (this.cart.items() ?? []).length > 0;
  }

  buy() {
    if (!this.hasItems || this.loading) return;
    const profile = this.auth.user();
    if (!profile) {
      this.authDialogVisible = true;
      return;
    }
    const userPayload = this.mapUser(profile);
    this.loading = true;
    this.cart.checkout(userPayload).subscribe({
      next: (res) => {
        this.loading = false;
        const detailMessage = res?.message ?? 'Tu compra se registro correctamente.';
        this.messages.add({
          severity: 'success',
          summary: 'Compra realizada',
          detail: detailMessage
        });
        const purchase = res?.data ?? null;
        this.cart.setLastPurchase(purchase ?? null);
        this.cart.clear();
        if (purchase) {
          this.router.navigateByUrl('/midetallecompra');
        }
      },
      error: (err) => {
        this.loading = false;
        this.cart.setLastPurchase(null);
        const detail = err?.error?.message ?? err?.message ?? 'No se pudo procesar la compra.';
        this.messages.add({ severity: 'error', summary: 'Error', detail });
      }
    });
  }

  goToLogin() {
    this.authDialogVisible = false;
    this.router.navigateByUrl('/login');
  }

  private mapUser(profile: UserProfile): User {
    return {
      id: profile.id,
      name: profile.name,
      lastname: profile.lastname,
      dni: (profile as any).dni ?? '',
      address: (profile as any).address ?? '',
      email: profile.email,
      username: profile.username,
      password: profile.password,
      role: profile.role,
      avatar: this.cleanBase64(profile.avatar ?? null)
    };
  }

  private cleanBase64(avatar: string | null): string | null {
  if (!avatar) return null;
  const commaIdx = avatar.indexOf(',');
  return commaIdx >= 0 ? avatar.substring(commaIdx + 1) : avatar;
}

}

