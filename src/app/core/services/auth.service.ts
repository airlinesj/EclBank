import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authStateSubject = new BehaviorSubject<boolean>(this.isLoggedIn());
  public authState$ = this.authStateSubject.asObservable();

  constructor(private router: Router) {}

  /**
   * Check if user is currently logged in
   */
  isLoggedIn(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  /**
   * Login user with credentials (simulate authentication)
   */
  login(email: string, password: string): Observable<boolean> {
    return new Observable(observer => {
      // Simulate API delay
      setTimeout(() => {
        // Simple validation check
        if (email && password) {
          const token = btoa(`${email}:${password}`);
          localStorage.setItem('auth_token', token);
          localStorage.setItem('user_email', email);
          this.authStateSubject.next(true);
          observer.next(true);
        } else {
          observer.next(false);
        }
        observer.complete();
      }, 800);
    });
  }

  /**
   * Logout user and clear authentication state
   */
  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_email');
    this.authStateSubject.next(false);
    this.router.navigate(['/login']);
  }

  /**
   * Get current user email
   */
  getCurrentUserEmail(): string | null {
    return localStorage.getItem('user_email');
  }
}
