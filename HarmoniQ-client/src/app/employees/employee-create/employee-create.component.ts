import { HttpClient } from '@angular/common/http';
import { Component, inject, output } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../_services/account.service';
import { this.errorHandler } from '../../_services/error-handler.service';

@Component({
  selector: 'app-employee-create',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './employee-create.component.html'
})
export class EmployeeCreateComponent {
  private toastr = inject(ToastrService);
  http = inject(HttpClient);
  department: any = {};
  private router = inject(Router);

  accountService = inject(AccountService);
  apiUrl = environment.apiUrl;

  constructor() {
    const route = inject(ActivatedRoute);
    route.params.subscribe((params) => {
      this.department = +params['id'];
    });
  }

  ngOnInit(): void {
    this.getEmployees();
  }

  getEmployees() {
    this.http
      .get(this.apiUrl + 'api/employee/' + this.department)
      .subscribe({
        next: (response) => (this.department = response),
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
        this.apiUrl + 'api/employee/' + this.department.id,
        this.department
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
      .delete(this.apiUrl + 'api/department/' + this.department.id)
      .subscribe({
        next: (response) => {
          console.log(response);
          this.toastr.success('Το τμήμα διαγράφηκε επιτυχώς');
          this.router.navigate(['/departments', this.department.id, '/edit']);
        },
        error: (error) => {
          this.errorHandler.handleError(error);
        },
        complete: () => {

        },
      });
  }
}
