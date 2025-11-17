import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { ResponseData } from '../model/responseData.model';
import { User } from '../model/user.model';
import { DtoBuyItems, DtoProductItem } from '../model/productItem.model';
import { DtoPurchases } from '../model/purchase.model';
import { CartDetail, DtoMyCart } from '../model/cart.model';
import { UserComment } from '../model/comment.model';
import { ReviewItem } from '../model/review.model';

export type CartItem = { id: string; title: string; price: number; qty: number };

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly base = 'http://localhost:8080/api/cart';
  private readonly storageKey = 'cart.items';
  private _items = signal<CartItem[]>([]);
  private _lastPurchase = signal<DtoPurchases | null>(null);
  readonly items = this._items.asReadonly();
  readonly total = computed(() => this._items().reduce((a, it) => a + it.price * it.qty, 0));
  readonly lastPurchase = this._lastPurchase.asReadonly();

  constructor(private http: HttpClient) {
    this.restore();
  }

  add(item: Omit<CartItem, 'qty'>) {
    const found = this._items().find((i) => i.id === item.id);
    const next = found
      ? this._items().map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i))
      : [...this._items(), { ...item, qty: 1 }];
    this.update(next);
  }

  remove(id: string) {
    const next = this._items().filter((i) => i.id !== id);
    this.update(next);
  }

  clear() {
    this.update([]);
  }

  findMyPurchases(userId: number): Observable<ResponseData<DtoMyCart[]>> {
    return this.http.get<ResponseData<DtoMyCart[]>>(`${this.base}/findMyPurchases/${userId}`);
  }

  findCartById(cartId: number): Observable<ResponseData<CartDetail>> {
    return this.http.get<ResponseData<CartDetail>>(`${this.base}/findById/${cartId}`);
  }

  listUserReviews(videogameId: number): Observable<ResponseData<UserComment[]>> {
    return this.http.get<ResponseData<UserComment[]>>(`${this.base}/listUserReviews/${videogameId}`);
  }

  listCompleteReviews(userId: number): Observable<ResponseData<ReviewItem[]>> {
    return this.http.get<ResponseData<ReviewItem[]>>(`${this.base}/AllCompleteReviews/${userId}`);
  }

  listMissingReviews(userId: number): Observable<ResponseData<ReviewItem[]>> {
    return this.http.get<ResponseData<ReviewItem[]>>(`${this.base}/AllCompleteMissing/${userId}`);
  }

  updateReview(itemId: number, payload: { score: number; comment: string }): Observable<ResponseData<any>> {
    return this.http.post<ResponseData<any>>(`${this.base}/updateReview/${itemId}`, payload);
  }

  checkout(user: User): Observable<ResponseData<DtoPurchases>> {
    const detailItems: DtoProductItem[] = this._items().map((item) => ({
      videogameId: Number(item.id),
      amount: item.qty,
      unitPrice: item.price,
      unitDiscount: 0,
      subtotal: 0
    }));

    if (detailItems.length === 0) {
      return throwError(() => new Error('No hay productos en el carrito.'));
    }

    const payload: DtoBuyItems = {
      user,
      detailItems
    };

    return this.http.post<ResponseData<DtoPurchases>>(`${this.base}/buyProducts`, payload);
  }

  setLastPurchase(data: DtoPurchases | null) {
    this._lastPurchase.set(data);
  }

  private update(items: CartItem[]) {
    this._items.set(items);
    this.persist(items);
  }

  private persist(items: CartItem[]) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(items));
    } catch {
      // ignore storage errors
    }
  }

  private restore() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      const parsed = raw ? JSON.parse(raw) : [];
      const normalized = Array.isArray(parsed) ? parsed : [];
      this._items.set(normalized);
    } catch {
      this._items.set([]);
    }
  }
}
