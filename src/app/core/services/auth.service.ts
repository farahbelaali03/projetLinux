import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AuthResponse, User } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = 'http://localhost:8000/api';
  currentUser = signal<User | null>(this.loadUser());
  isAuthenticated = signal<boolean>(!!this.getToken());

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/login`, { email, password }).pipe(tap(res => this.saveSession(res)));
  }

  register(name: string, email: string, password: string, password_confirmation: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/register`, { name, email, password, password_confirmation }).pipe(tap(res => this.saveSession(res)));
  }

  logout(): Observable<any> {
    return this.http.post(`${this.API}/logout`, {}).pipe(tap(() => this.clearSession()));
  }

  getToken(): string | null { return localStorage.getItem('tf_token'); }

  private saveSession(res: AuthResponse): void {
    localStorage.setItem('tf_token', res.token);
    localStorage.setItem('tf_user', JSON.stringify(res.user));
    this.currentUser.set(res.user);
    this.isAuthenticated.set(true);
  }

  clearSession(): void {
    localStorage.removeItem('tf_token');
    localStorage.removeItem('tf_user');
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  private loadUser(): User | null {
    const raw = localStorage.getItem('tf_user');
    return raw ? JSON.parse(raw) : null;
  }
}
