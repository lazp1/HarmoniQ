import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from './nav/nav.component';
import { Router } from '@angular/router';
import { AccountService } from './_services/account.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  private accountService = inject(AccountService);
  title = 'HarmoniQ - HRMS';
  constructor(private router: Router) { }

  ngOnInit(): void {
    // console.log('App component initialized');
    this.checkRole();
    this.setCurrentUser();
  }

  setCurrentUser() {
    const userString = localStorage.getItem('user');
    if (!userString) return;
    const user = JSON.parse(userString);
    this.accountService.currentUser.set(user);
  }


  checkRole() {
    const userRole = localStorage.getItem('userRole');
    if (userRole) {
      if (userRole === 'Admin') {
        this.router.navigate(['admin/dashboard']);
      }
      if (userRole === 'Manager') {
        this.router.navigate(['manager/dashboard']);
      }
      if (userRole === 'Employee') {
        this.router.navigate(['employee/dashboard']);
      }
    }
  }
}
