import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Department } from '../../_models/department';
import { environment } from '../../../environments/environment';
import { AccountService } from '../../_services/account.service';
import { ErrorHandlerService } from '../../_services/error-handler.service';

@Component({
  selector: 'app-department-create',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './department-create.component.html'
})
export class DepartmentCreateComponent {
  private toastr = inject(ToastrService);
  apiUrl = environment.apiUrl;
  http = inject(HttpClient);
  department: Department = {
    Name: ''
  };
  private router = inject(Router);
  accountService = inject(AccountService);
  errorHandler = inject(ErrorHandlerService);


  createDepartment() {
    this.http
      .post(
        this.apiUrl + 'api/department/',
        this.department
      )
      .subscribe({
        next: (response) => {
          this.toastr.success('Το τμήμα προστέθηκε επιτυχώς');
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
