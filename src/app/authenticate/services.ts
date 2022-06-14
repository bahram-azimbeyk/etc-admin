import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Urls } from '../settings';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(private authService: AuthService, private router: Router) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): true | UrlTree {
    const url: string = state.url;
    return this.checkLogin(url);
  }
  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): true | UrlTree {
    return this.canActivate(route, state);
  }
  checkLogin(url: string): true | UrlTree {
    if (this.authService.checkAuthenticated()) return true;
    this.authService.redirectUrl = url;
    return this.router.parseUrl('/signin');
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  isLoggedin = false;
  redirectUrl: string;
  constructor(private httpClient: HttpClient) {}
  checkAuthenticated() {
    var token = localStorage.getItem('token') || '';
    if (token) {
      return true;
    }
    return false;
  }
  login(email: string, password: string) {
    return this.httpClient
      .post<any>(`${Urls.rootUrl}/api/admin/auth/login/`, {
        email: email,
        password: password,
      })
      .pipe(
        tap((response) => {
          localStorage.setItem('token', 'token ' + response['token']);
          localStorage.setItem('email', response['email']);
          window.location.href = this.redirectUrl || '/';
        })
      );
  }
  logout() {
    var token = localStorage.getItem('token') || '';
    var httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: token,
      }),
    };
    return this.httpClient
      .post<any>(`${Urls.rootUrl}/api/admin/auth/logout/`, {}, httpOptions)
      .pipe(
        tap(
          (result) => {
            localStorage.removeItem('token');
            localStorage.removeItem('email');
          },
          (error) => {
            localStorage.removeItem('token');
            localStorage.removeItem('email');
          }
        )
      );
  }
  get token() {
    return localStorage.getItem('token');
  }
}
