import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import { AuthService } from './auth.service';
import { AppRoutesPaths } from '../../../shared/app.constants';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  readonly appRoutesPaths = AppRoutesPaths;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  canActivate(_route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.auth.isAuthenticated()) {
      return true;
    }

    this.router.navigate(['/' + this.appRoutesPaths.LOGIN], {
      queryParams: { returnUrl: state.url }
    });
    
    return false;
  }
}
