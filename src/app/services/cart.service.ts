import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { ResponseData } from '../model/responseData.model';
import { User } from '../model/user.model';
import { DtoBuyItems, DtoProductItem } from '../model/productItem.model';
import { DtoPurchases } from '../model/purchase.model';
import { CartDetail, DtoMyCart } from '../model/cart.model';

export type CartItem = { id: string; title: string; price: number; qty: number };

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly base = 'http://localhost:8080/api/cart';
  private _items = signal<CartItem[]>([]);
  private _lastPurchase = signal<DtoPurchases | null>(null);
  readonly items = this._items.asReadonly();
  readonly total = computed(() => this._items().reduce((a, it) => a + it.price * it.qty, 0));
  readonly lastPurchase = this._lastPurchase.asReadonly();

  constructor(private http: HttpClient) {}

  add(item: Omit<CartItem, 'qty'>) {
    const found = this._items().find((i) => i.id === item.id);
    if (found) {
      this._items.update((arr) => arr.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i)));
    } else {
      this._items.update((arr) => [...arr, { ...item, qty: 1 }]);
    }
  }

  remove(id: string) {
    this._items.update((arr) => arr.filter((i) => i.id !== id));
  }

  clear() {
    this._items.set([]);
  }

  findMyPurchases(userId: number): Observable<ResponseData<DtoMyCart[]>> {
    return this.http.get<ResponseData<DtoMyCart[]>>(`${this.base}/findMyPurchases/${userId}`);
  }

  findCartById(cartId: number): Observable<ResponseData<CartDetail>> {
    return this.http.get<ResponseData<CartDetail>>(`${this.base}/findById/${cartId}`);
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
}
