import { Injectable,Inject, PLATFORM_ID  } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { User, LoginRequest, AuthResponse } from '../models/user.model';
import { isPlatformBrowser } from '@angular/common'; 
import { environment } from '../../enviroments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
 private apiUrl = environment.apiUrl; // Backend API URL

  constructor(private http: HttpClient, 
    @Inject(PLATFORM_ID) private platformId: any

  ) {}

  // User registration
  register(user: User): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/users/register`, user);
  }

  // User login
 login(credentials: LoginRequest): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/users/login`, credentials)
    .pipe(
      tap(response => {
        console.log('✅ AUTH SERVICE: Full response:', response);
        
        // Extract token and user from the nested data property
        if (response.data && response.data.token) {
        // ✅ THIS CODE ONLY RUNS IN BROWSER!
        // User interaction → Always in browser
          if (isPlatformBrowser(this.platformId)) {// ← ALWAYS TRUE HERE
            /*You're using isPlatformBrowser checks BECAUSE you have SSR enabled. 
            If you were doing client-side rendering only, you wouldn't need these checks at all!
            
            -isPlatformBrowser(this.platformId) does one simple thing:

             It prevents your app from CRASHING on the server
              Without this check:
              typescript
             // ❌ On SERVER: CRASH! 💥
              isLoggedIn(): boolean {
              return !!localStorage.getItem('token'); // localStorage doesn't exist on server!
                }
               // Error: localStorage is not defined
            */
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            console.log('✅ AUTH SERVICE: Token saved:', response.data.token);
            console.log('✅ AUTH SERVICE: User saved:', response.data.user);
          }
        } else {
          console.error('❌ AUTH SERVICE: Token not found in response');
        }
      })
    );
}
  // User logout
 logout(): void {
  // ✅ ADD BROWSER CHECK
  if (isPlatformBrowser(this.platformId)) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}

  // Check if user is logged in
  isLoggedIn(): boolean {
  // ✅ ADD BROWSER CHECK
  if (isPlatformBrowser(this.platformId)) {
    return !!localStorage.getItem('token');
  }
  return false; // On server, return false
}
  // Get current user from localStorage
getCurrentUser(): any {
  // ✅ ADD BROWSER CHECK
  if (isPlatformBrowser(this.platformId)) {
    const user = localStorage.getItem('user');
    if (user && user !== 'undefined') {  
      return JSON.parse(user);
    }
  }
  return null;
}

  // Get JWT token from localStorage
  getToken(): string | null {
  // ✅ ADD BROWSER CHECK
  if (isPlatformBrowser(this.platformId)) {
    return localStorage.getItem('token');
  }
  return null;
}
}