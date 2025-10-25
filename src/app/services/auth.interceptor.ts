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

    // Target only our backend, skip profile endpoint
    const isBackend = req.url.startsWith('http://localhost:8080');
    const isProfile = req.url.endsWith('/api/auth/profile');

    if (basic && isBackend && !isProfile) {
      const authReq = req.clone({ setHeaders: { Authorization: `Basic ${basic}` } });
      return next.handle(authReq);
    }

    return next.handle(req);
  }
}

