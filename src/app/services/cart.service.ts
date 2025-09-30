import { Injectable, signal, computed } from '@angular/core';

export type CartItem = { id: string; title: string; price: number; qty: number };

@Injectable({ providedIn: 'root' })
export class CartService {
  private _items = signal<CartItem[]>([]);
  readonly items = this._items.asReadonly();
  readonly total = computed(() => this._items().reduce((a, it) => a + it.price * it.qty, 0));

  add(item: Omit<CartItem, 'qty'>) {
    const found = this._items().find(i => i.id === item.id);
    if (found) {
      this._items.update(arr => arr.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
    } else {
      this._items.update(arr => [...arr, { ...item, qty: 1 }]);
    }
  }
  remove(id: string) { this._items.update(arr => arr.filter(i => i.id != id)); }
  clear() { this._items.set([]); }
}
