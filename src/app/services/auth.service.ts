import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { map, tap, switchMap, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

export type Role = { id: number; description: string };
export type UserProfile = {
  id: number;
  name: string;
  lastname: string;
  email: string;
  username: string;
  password: string;
  role: Role;
  avatar?: string | null;
};

type ProfileResponse = {
  status?: boolean;
  code?: number;
  data?: Partial<UserProfile>;
  avatar?: string | null;
};

const API = 'http://localhost:8080/api/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user = signal<UserProfile | null>(this.restoreUser());
  readonly user = this._user.asReadonly();

  constructor(private http: HttpClient, private router: Router) {}

  private restoreUser(): UserProfile | null {
    try {
      const raw = localStorage.getItem('auth.user');
      return raw ? (JSON.parse(raw) as UserProfile) : null;
    } catch {
      return null;
    }
  }

  private persist(user: UserProfile | null, basic?: string | null) {
    if (user) localStorage.setItem('auth.user', JSON.stringify(user));
    else localStorage.removeItem('auth.user');
    if (basic) localStorage.setItem('auth.basic', basic);
    else localStorage.removeItem('auth.basic');
  }

  get basicToken(): string | null {
    return localStorage.getItem('auth.basic');
  }

  get role(): string {
    const r = this._user()?.role?.description || '';
    return (r || '').toString().toUpperCase();
  }

  login(username: string, password: string): Observable<UserProfile> {
    const body = { username, password };
    const basic = btoa(`${username}:${password}`);

    return this.http.post<ProfileResponse>(`${API}/profile`, body).pipe(

      map((res) => {
        console.log('🧾 Respuesta completa del backend:', res);
        console.log('🖼️ Avatar recibido:', res.avatar ? res.avatar.substring(0, 100) : 'Sin avatar');
        if (!res || !res.data) throw new Error('Credenciales inválidas');
        const u: UserProfile = {
          id: res.data.id!,
          name: res.data.name!,
          lastname: res.data.lastname!,
          email: res.data.email!,
          username: res.data.username!,
          password: res.data.password!,
          role: res.data.role as Role,
          avatar: res.data.avatar ? `data:image/png;base64,${res.data.avatar}` : null,
        };
        return u;
      }),
      
      tap((u) => {
        this._user.set(u);
        this.persist(u, basic);

        // Role-based navigation
        const role = (u.role?.description || '').toUpperCase();
        if (role === 'ADMINISTRADOR' || role === 'EMPLEADO') {
          this.router.navigateByUrl('/dashboard');
        } else {
          this.router.navigateByUrl('/future-videogames');
        }
      }),
      // consume session-* endpoint using Basic Auth, but do not block UX on failure
      switchMap((u) => this.verifySessionForRole().pipe(
        map(() => u),
        catchError(() => of(u))
      ))
    );
  }

  // Optionally verify role-protected session endpoint using Basic Auth
  verifySessionForRole(): Observable<string> {
    const role = this.role;
    const basic = this.basicToken;
    if (!basic) throw new Error('No auth');
    let endpoint = '';
    if (role === 'ADMINISTRADOR') endpoint = 'session-admin';
    else if (role === 'EMPLEADO') endpoint = 'session-employee';
    else endpoint = 'session-client';

    const headers = new HttpHeaders({ Authorization: `Basic ${basic}` });
    return this.http.get(`${API}/${endpoint}`, { headers, responseType: 'text' });
  }

  updateSession(user: UserProfile) {
    const basic = btoa(`${user.username}:${user.password}`);
    this._user.set(user);
    this.persist(user, basic);
  }

  logout(redirect = true) {
    console.log('🟡 Entrando a logout()...');
    this._user.set(null);
    this.persist(null, null);
    if (redirect) {
      this.router.navigateByUrl('/future-videogames');
    }
  }
}
