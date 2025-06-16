import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, filter, take, switchMap } from 'rxjs/operators';
import { AuthStateService } from '../services/auth-state/auth-state.service';


@Injectable({
  providedIn: 'root'
})
export class PublicGuard implements CanActivate {
  constructor(
    private authService: AuthStateService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.authService.authInitialized$.pipe(
      filter(initialized => initialized),
      take(1),
      switchMap(() => this.authService.isLoggedIn$),
      take(1),
      map(isLoggedIn => {
        if (!isLoggedIn) {
          return true;
        } else {
          this.router.navigate(['/dashboard']);
          return false;
        }
      })
    );
  }
}
