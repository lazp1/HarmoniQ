import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Router, RouterModule } from '@angular/router';
import { AccountService } from '../../_services/account.service';
import { ToastrService } from 'ngx-toastr';
import { ErrorHandlerService } from '../../_services/error-handler.service';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './employee-list.component.html'
})
export class EmployeeListComponent {
  http = inject(HttpClient);
  accountService = inject(AccountService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  employees: any;
  apiUrl = environment.apiUrl;
  registerMode = false;
  private errorHandler = inject(ErrorHandlerService);

  ngOnInit(): void {
    this.getEmployees();
  }

  getEmployees() {
    this.http.get(this.apiUrl + 'api/employee').subscribe({
      next: (response) => (this.employees = response),
      error: (error) => {

        this.errorHandler.handleError(error);
      },
      complete: () => {

      },
    });
  }
}
