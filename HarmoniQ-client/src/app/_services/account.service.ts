import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../_models/user';
import { Root } from '../_models/root';
import { environment } from '../../environments/environment';
import { map, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private http = inject(HttpClient);
  private router = inject(Router);
  apiUrl = environment.apiUrl;
  baseUrl = this.apiUrl + 'api/auth/';
  currentUser = signal<Root | null>(null);

  login(model: any) {
    return this.http.post<Root>(this.baseUrl + 'login', model).pipe(
      tap((response) => {
        if (response) {
          localStorage.setItem('user', JSON.stringify(response));
          this.currentUser.set(response);
          const userRole = response.user.role;
          localStorage.setItem('userRole', userRole);

          // Route based on role
          this.navigateByRole(userRole);
        }
      })
    );
  }

  register(model: any) {
    return this.http.post<Root>(this.baseUrl + 'register', model).pipe(
      map((user) => {
        return user;
      })
    );
  }

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    this.currentUser.set(null);
    void this.router.navigate(['/']);
  }

  navigateByRole(role: string) {
    if (role === 'Admin') {
      void this.router.navigateByUrl('/admin/dashboard');
    } else if (role === 'Manager') {
      void this.router.navigateByUrl('/manager/dashboard'); 
    } else if (role === 'User') {
      void this.router.navigateByUrl('/employee/dashboard');
    }
  }
}
