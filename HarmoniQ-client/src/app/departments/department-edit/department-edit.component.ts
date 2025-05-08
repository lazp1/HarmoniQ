import { HttpClient } from '@angular/common/http';
import { Component, inject, output } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { AccountService } from '../../_services/account.service';
import { ErrorHandlerService } from '../../_services/error-handler.service';

@Component({
  selector: 'app-department-edit',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './department-edit.component.html'
})
export class DepartmentEditComponent {
  private toastr = inject(ToastrService);
  http = inject(HttpClient);
  department: any = {};
  apiUrl = environment.apiUrl;
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
    this.getDepartment();
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

  updateDepartment() {
    this.http
      .put(
        this.apiUrl + 'api/department/' + this.department.id,
        this.department
      )
      .subscribe({
        next: (response) => {
          this.toastr.success('Το τμήμα ενημερώθηκε επιτυχώς');
          this.router.navigate(['admin/departments']);
        },
        error: (error) => {
          this.errorHandler.handleError(error);
        },
        complete: () => {

        },
      });
  }

  deleteDepartment() {
    this.http
      .delete(this.apiUrl + 'api/department/' + this.department.id)
      .subscribe({
        next: (response) => {
          this.toastr.success('Το τμήμα διαγράφηκε επιτυχώς');
          this.router.navigate(['admin/departments']);
        },
        error: (error) => {
          this.errorHandler.handleError(error);
        },
        complete: () => {

        },
      });
  }
}
