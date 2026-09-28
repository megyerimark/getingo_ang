import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { environment } from '../../environments/environment';
import { AuthResponse, User } from '../core/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class Auth {

  private readonly apiUrl = environment.apiUrl;
  private readonly tokenKey = 'auth_token';

  currentUser = signal<User | null>(null);

  constructor(private http: HttpClient) {}

  register(data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }): Observable<AuthResponse> {

    return this.http
      .post<AuthResponse>(
        `${this.apiUrl}/regisztracio`,
        data
      )
      .pipe(
        tap(response => {
          this.saveToken(response.access_token);
          this.currentUser.set(response.user);
        })
      );
  }

  login(data: {
    email: string;
    password: string;
  }): Observable<AuthResponse> {

    return this.http
      .post<AuthResponse>(
        `${this.apiUrl}/bejelentkezes`,
        data
      )
      .pipe(
        tap(response => {
          this.saveToken(response.access_token);
          this.currentUser.set(response.user);
        })
      );
  }

  me(): Observable<User> {

    return this.http
      .get<User>(
        `${this.apiUrl}/user`
      )
      .pipe(
        tap(user => {
          this.currentUser.set(user);
        })
      );
  }

  logout(): Observable<{ message: string }> {

    return this.http
      .post<{ message: string }>(
        `${this.apiUrl}/logout`,
        {}
      )
      .pipe(
        tap(() => {
          this.clearAuth();
        })
      );
  }

  saveToken(token: string): void {
    localStorage.setItem(
      this.tokenKey,
      token
    );
  }

  getToken(): string | null {
    return localStorage.getItem(
      this.tokenKey
    );
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  clearAuth(): void {
    localStorage.removeItem(this.tokenKey);
    this.currentUser.set(null);
  }
}