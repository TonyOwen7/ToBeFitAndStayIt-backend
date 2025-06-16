import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { PublicGuard } from './public.guard';
import { AuthStateService } from '../services/auth-state/auth-state.service';

describe('PublicGuard', () => {
  let guard: PublicGuard;
  let authService: jasmine.SpyObj<AuthStateService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const authServiceMock = jasmine.createSpyObj('AuthStateService', ['isLoggedIn$', 'authInitialized$']);
    const routerMock = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        PublicGuard,
        { provide: AuthStateService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    });

    guard = TestBed.inject(PublicGuard);
    authService = TestBed.inject(AuthStateService) as jasmine.SpyObj<AuthStateService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should allow unauthenticated users', (done) => {
    authService.authInitialized$ = of(true);
    authService.isLoggedIn$ = of(false);

    guard.canActivate().subscribe(canActivate => {
      expect(canActivate).toBeTrue();
      done();
    });
  });

  it('should redirect authenticated users', (done) => {
    authService.authInitialized$ = of(true);
    authService.isLoggedIn$ = of(true);

    guard.canActivate().subscribe(canActivate => {
      expect(canActivate).toBeFalse();
      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
      done();
    });
  });
});
