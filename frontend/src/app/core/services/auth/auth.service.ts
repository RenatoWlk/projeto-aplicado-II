import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { TokenService } from '../token/token.service';
import { jwtDecode } from 'jwt-decode';
import { UserRole } from '../../../shared/app.enums';
import { Router } from '@angular/router';

interface AuthRequest {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
}

interface DecodedToken {
  sub?: string;
  id?: string;
  name?: string;
  userName?: string;
  email?: string;
  userEmail?: string;
  role?: string;
  userRole?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API = '/api/auth';

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    private router: Router
  ) {}

  /**
   * Sends login credentials to the backend and stores the returned JWT token.
   * @param email - User's email
   * @param password - User's password
   * @returns Observable of AuthResponse containing the token
   */
  login(email: string, password: string): Observable<AuthResponse> {
    const payload: AuthRequest = { email, password };
    return this.loginAndGetToken(payload).pipe(
      tap((response: AuthResponse) => {
        this.tokenService.setToken(response.token);
      })
    );
  }

  loginAndGetToken(payload: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`/api/auth/login`, payload);
  }

  /**
   * Clears the stored JWT token (logout).
   */
  logout(): void {
    this.tokenService.clearToken();
    this.router.navigate(['/login']);
  }

  /**
   * Checks whether a valid token is stored.
   * @returns true if authenticated, false otherwise
   */
  isAuthenticated(): boolean {
    return this.tokenService.isLogged();
  }

  /**
   * Retrieves the current user's ID from the token.
   * @returns user ID or empty string
   */
  getCurrentUserId(): string {
    const decoded = this.decodeToken();
    return decoded?.sub || decoded?.id || '';
  }

  /**
   * Retrieves the current user's name from the token.
   * @returns user name or empty string
   */
  getCurrentUserName(): string {
    const decoded = this.decodeToken();
    return decoded?.name || decoded?.userName || '';
  }

  /**
   * Retrieves the current user's email from the token.
   * @returns user email or empty string
   */
  getCurrentUserEmail(): string {
    const decoded = this.decodeToken();
    return decoded?.email || decoded?.userEmail || '';
  }

  /**
   * Retrieves the current user's role from the token.
   * @returns user role as UserRole enum or null if invalid
   */
  getCurrentUserRole(): UserRole | null {
    const decoded = this.decodeToken();
    const role = decoded?.role || decoded?.userRole;

    if (role && Object.values(UserRole).includes(role as UserRole)) {
      return role as UserRole;
    }

    return null;
  }

  /**
   * Decodes the JWT token safely.
   * @returns DecodedToken object or null if token is missing or invalid
   */
  private decodeToken(): DecodedToken | null {
    const token = this.tokenService.getToken();
    if (!token) return null;

    try {
      return jwtDecode<DecodedToken>(token);
    } catch (error) {
      console.error('Invalid or malformed token:', error);
      return null;
    }
  }
}
