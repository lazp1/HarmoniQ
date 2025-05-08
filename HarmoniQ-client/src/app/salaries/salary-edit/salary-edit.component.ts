import { HttpClient } from '@angular/common/http';
import { Component, inject, output } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../_services/account.service';
import { environment } from '../../../environments/environment';
import { ErrorHandlerService } from '../../_services/error-handler.service';

@Component({
  selector: 'app-salary-edit',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './salary-edit.component.html'
})
export class SalaryEditComponent {
  accountService = inject(AccountService);
  private toastr = inject(ToastrService);
  private router = inject(Router);
  private errorHandler = inject(ErrorHandlerService);
  http = inject(HttpClient);
  salary: any;
  employees: any;
  apiUrl = environment.apiUrl;

  constructor() {
    const route = inject(ActivatedRoute);
    route.params.subscribe((params) => {
      this.salary = +params['id'];
    });
  }

  ngOnInit(): void {
    this.getEmployees();
    this.getSalary();
  }

  updateSalary() {
    this.http
      .post(this.apiUrl + 'api/salary', this.salary)
      .subscribe({
        next: (response) => {
          this.toastr.success('Το μισθός ενημερώθηκε επιτυχώς');
          this.router.navigate(['salaries']);
        },
        error: (error) => {
          this.errorHandler.handleError(error);
        },
        complete: () => {

        },
      });
  }

  getSalary() {
    this.http.get(this.apiUrl + 'api/salary').subscribe({
      next: (response) => (this.salary = response),
      error: (error) => {
        this.errorHandler.handleError(error);
      },
      complete: () => {
        this.salary = this.salary[0];
      },
    });
  }

  getEmployees() {
    this.http
      .get(this.apiUrl + 'api/employee/')
      .subscribe({
        next: (response) => (this.employees = response),
        error: (error) => {
          this.errorHandler.handleError(error);
        },
        complete: () => {

        },
      });
  }

}
