import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../_models/user';
import { Root } from '../_models/root';
import { environment } from '../../environments/environment';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private http = inject(HttpClient);
  apiUrl = environment.apiUrl;
  baseUrl = this.apiUrl + 'api/auth/';
  currentUser = signal<Root | null>(null);

  login(model: any) {
    return this.http.post<Root>(this.baseUrl + 'login', model).pipe(
      map((user) => {
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUser.set(user);
          const cleanedUserRole = user.user.role?.replace(/"/g, '');
          localStorage.setItem('userRole', JSON.stringify(cleanedUserRole));
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
  }
}
