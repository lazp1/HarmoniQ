import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './department-list.component.html'
})
export class DepartmentListComponent {
  http = inject(HttpClient);
  departments: any;
  apiUrl = environment.apiUrl;
  registerMode = false;

  ngOnInit(): void {
    this.getDepartments();
  }

  getDepartments() {
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
