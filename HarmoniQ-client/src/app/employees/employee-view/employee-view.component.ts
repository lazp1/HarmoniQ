import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonModule, DatePipe } from '@angular/common';
import { environment } from '../../../environments/environment';
import { AccountService } from '../../_services/account.service';
import { ErrorHandlerService } from '../../_services/error-handler.service';

@Component({
  selector: 'app-employee-view',
  standalone: true,
  imports: [RouterModule, CommonModule],
  providers: [DatePipe],
  templateUrl: './employee-view.component.html'
})
export class EmployeeViewComponent {
  private toastr = inject(ToastrService);
  http = inject(HttpClient);
  employee: any = {};
  private router = inject(Router);
  apiUrl = environment.apiUrl;
  dept: any = {};
  manager: any = {};
  accountService = inject(AccountService);
  errorHandler = inject(ErrorHandlerService);

  constructor() {
    const route = inject(ActivatedRoute);
    route.params.subscribe((params) => {
      this.employee = +params['id'];
    });
  }

  ngOnInit(): void {
    this.getEmployee();
    this.getEmployeeDepartment();
    this.isManager();
  }

  getEmployee() {
    this.http
      .get(this.apiUrl + 'api/employee/' + this.employee)
      .subscribe({
        next: (response) => (this.employee = response),
        error: (error) => {
          this.errorHandler.handleError(error);
        },
        complete: () => {

        },
      });
  }

  getEmployeeDepartment() {
    this.http
      .get(this.apiUrl + 'api/employeedepartment/employee/' + this.employee)
      .subscribe({
        next: (response) => {
          this.dept = response;
          this.dept = this.dept[0];
        },
        error: (error) => {
          this.errorHandler.handleError(error);
        },
        complete: () => {

        },
      });
  }

  isManager() {
    this.http
      .get(this.apiUrl + 'api/managerdepartment/employee/' + this.employee)
      .subscribe({
        next: (response) => {
          this.manager = response;
          this.manager = this.manager[0];
        },
        error: (error) => {
          this.errorHandler.handleError(error);
        },
        complete: () => {

        },
      });
  }

  deleteEmployee() {
    this.http
      .delete(this.apiUrl + 'api/employee/' + this.employee.id)
      .subscribe({
        next: (response) => {
          console.log(response);
          this.toastr.success('Ο υπάλληλος διαγράφηκε επιτυχώς');
          this.router.navigate(['/admin/employees']);
        },
        error: (error) => {
          this.errorHandler.handleError(error);
        },
        complete: () => {

        },
      });
  }
}
