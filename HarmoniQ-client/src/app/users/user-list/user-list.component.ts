import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './user-list.component.html'
})
export class UserListComponent {
  http = inject(HttpClient);
  employees: any;
  apiUrl = environment.apiUrl;
  registerMode = false;

  ngOnInit(): void {
    this.getEmployees();
  }

  getEmployees() {
    this.http.get(this.apiUrl + 'api/user').subscribe({
      next: (response) => (this.employees = response),
      error: (error) => {
        console.error(error);
      },
      complete: () => {

      },
    });
  }
}
