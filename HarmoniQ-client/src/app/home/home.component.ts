import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AccountService } from '../_services/account.service';
import { RegisterComponent } from '../register/register.component';
import { Router } from '@angular/router';

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

  ngOnInit(): void {
    // No need to check login status here as the guard handles it
  }

  registerToggle() {
    this.registerMode = !this.registerMode;
    this.getDepts();
  }

  cancelRegisterMode(event: boolean) {
    this.registerMode = false;
  }

  getDepts() {
    this.http.get(this.apiUrl + 'api/department').subscribe({
      next: (response) => (this.departments = response),
      error: (error) => console.log(error),
      complete: () => console.log('Request completed'),
    });
  }
}