import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environment';
import { AccountService } from '../../_services/account.service';
import { ErrorHandlerService } from '../../_services/error-handler.service';

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './department-view.component.html'
})
export class DepartmentViewComponent {
  private toastr = inject(ToastrService);
  http = inject(HttpClient);
  apiUrl = environment.apiUrl;
  department: any = {};
  employees: any = {};
  private router = inject(Router);
  accountService = inject(AccountService);
  errorHandler = inject(ErrorHandlerService);

  constructor() {
    const route = inject(ActivatedRoute);
    route.params.subscribe((params) => {
      this.department = +params['id'];
    });
  }

  ngOnInit(): void {
    this.getEmployees();
    this.getDepartment();
  }

  getEmployees() {
    this.http
      .get(this.apiUrl + 'api/department/' + this.department + '/employees')
      .subscribe({
        next: (response) => (this.employees = response),
        error: (error) => {
          this.errorHandler.handleError(error);
        },
        complete: () => {

        },
      });
  }

  getDepartment() {
    this.http
      .get(this.apiUrl + 'api/department/' + this.department)
      .subscribe({
        next: (response) => (this.department = response),
        error: (error) => {
          this.errorHandler.handleError(error);
        },
        complete: () => {

        },
      });
  }
}
