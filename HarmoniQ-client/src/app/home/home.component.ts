import { Component, inject, OnInit } from '@angular/core';
import { RegisterComponent } from '../register/register.component';
import { HttpClient } from '@angular/common/http';
import { AccountService } from '../_services/account.service';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RegisterComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  http = inject(HttpClient);
  departments: any;
  registerMode = false;
  apiUrl = environment.apiUrl;

  constructor(private accountService: AccountService, private router: Router) { }

  checkLoginStatus() {
    if (localStorage.getItem('user')) {
      const user = localStorage.getItem('user');
      let userRole = JSON.parse(user ?? '');
      if (userRole) {
        userRole = userRole.user.role;
      }
      if (userRole === 'Admin') {
        this.router.navigate(['admin/dashboard']);
      }
      if (userRole === 'Manager') {
        this.router.navigate(['manager/dashboard']);
      }
      if (userRole === 'User') {
        this.router.navigate(['employee/dashboard']);
      }
    }
  }

  ngOnInit(): void {
    this.checkLoginStatus();
  }

  registerToggle() {
    this.registerMode = !this.registerMode;
    this.getDepts();
  }

  cancelRegisterMode(event: boolean) {
    this.registerMode = event;
  }

  getDepts() {
    this.http.get(this.apiUrl + 'api/department').subscribe({
      next: (response) => (this.departments = response),
      error: (error) => {
        console.error(error);
      },
      complete: () => {

      },
    });
  }
}