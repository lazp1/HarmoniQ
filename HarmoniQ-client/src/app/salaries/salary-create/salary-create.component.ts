import { HttpClient } from '@angular/common/http';
import { Component, inject, output } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { AccountService } from '../../_services/account.service';
import { ErrorHandlerService } from '../../_services/error-handler.service';

@Component({
  selector: 'app-salary-create',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './salary-create.component.html'
})
export class SalaryCreateComponent {
  private toastr = inject(ToastrService);
  accountService = inject(AccountService);
  http = inject(HttpClient);
  private errorHandler = inject(ErrorHandlerService);
  salary: any = {};
  employees: any;
  apiUrl = environment.apiUrl;

  private router = inject(Router);

  constructor() {
    const route = inject(ActivatedRoute);
    route.params.subscribe((params) => {
      this.salary = +params['id'];
    });
  }

  ngOnInit(): void {
    this.getEmployees();
  }

  submitSalary() {
    this.http
      .post(this.apiUrl + 'api/employee', this.salary)
      .subscribe({
        next: (response) => {
          console.log(response);
          this.toastr.success('Η μισθοδοσία καταχωρήθηκε επιτυχώς');
          this.router.navigate(['/admin/salaries']);
        },
        error: (error) => {
          this.errorHandler.handleError(error);
        },
        complete: () => {

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

  updateEmployee() {
    this.http
      .put(
        this.apiUrl + 'api/employee/' + this.salary.id,
        this.salary
      )
      .subscribe({
        next: (response) => {
          console.log(response);
          this.toastr.success('Το τμήμα ενημερώθηκε επιτυχώς');
          this.router.navigate(['/admin/employees']);
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
      .delete(this.apiUrl + 'api/salary/' + this.salary.id)
      .subscribe({
        next: (response) => {
          console.log(response);
          this.toastr.success('Το τμήμα διαγράφηκε επιτυχώς');
          // this.router.navigate([
          //   '/salarys/' + this.salary.id + '/edit',
          // ]);
          this.router.navigate(['/salarys', this.salary.id, '/edit']);
        },
        error: (error) => {
          this.errorHandler.handleError(error);
        },
        complete: () => {

        },
      });
  }
}
