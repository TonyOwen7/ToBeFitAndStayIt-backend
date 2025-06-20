import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const authToken = localStorage.getItem('auth_token'); // Retrieve stored token
    if (authToken) {
      const clonedReq = req.clone({
        setHeaders: { Authorization: `Bearer ${authToken}` }
      });
      return next.handle(clonedReq);
    }
    return next.handle(req);
  }
}
