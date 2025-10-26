import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const basic = this.auth.basicToken;

    // Target our backend (absolute or relative paths), skip profile endpoint used for login
    const isBackend = req.url.startsWith('http://localhost:8080') || req.url.startsWith('/api/');
    const isProfile = req.url.endsWith('/api/auth/profile');

    if (basic && isBackend && !isProfile) {
      // Do not override if header already present
      const already = req.headers.has('Authorization');
      const toHandle = already
        ? req
        : req.clone({ setHeaders: { Authorization: `Basic ${basic}` } });
      return next.handle(toHandle);
    }

    return next.handle(req);
  }
}
