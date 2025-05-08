import { HttpClient } from '@angular/common/http';
import { Component, inject, output } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgFor } from '@angular/common';
import { environment } from '../../../environments/environment';
import { AccountService } from '../../_services/account.service';
import { ErrorHandlerService } from '../../_services/error-handler.service';

@Component({
  selector: 'app-employee-edit',
  standalone: true,
  imports: [FormsModule, NgFor],
  templateUrl: './employee-edit.component.html'
})
export class EmployeeEditComponent {
  private toastr = inject(ToastrService);
  http = inject(HttpClient);
  employee: any = {};
  apiUrl = environment.apiUrl;
  departments: any[] = [];
  dept: any = {};
  private router = inject(Router);
  department: any;
  manager: any;
  managerUpd: any;
  accountService = inject(AccountService);
  errorHandler = inject(ErrorHandlerService);

  constructor() {
    const route = inject(ActivatedRoute);
    route.params.subscribe((params) => {
      this.employee = +params['id'];
    });
  }

  ngOnInit(): void {
    this.getEmployeeDepartment();
    this.getDepartments();
    this.getEmployee();
    this.isManager();
  }

  getEmployee() {
    this.http
      .get(this.apiUrl + 'api/employee/' + this.employee)
      .subscribe({
        next: (response) => (this.employee = response,
          this.employee.UserId = 0),
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

  getDepartments() {
    this.http
      .get(this.apiUrl + 'api/department')
      .subscribe({
        next: (response: Object) => (this.departments = response as any[]),
        error: (error) => {
          this.errorHandler.handleError(error);
        },
        complete: () => {

        },
      });
  }

  isManager() {
    this.http.get(this.apiUrl + 'api/managerdepartment/employee/' + this.employee).subscribe({
      next: (response) => {
        this.manager = response;
        this.manager = this.manager[0];
        console.log(this.manager);
      },
      error: (error) => {
        this.toastr.error(
          error.error.message ??
          'Κάτι πήγε στραβά, σιγουρευτείτε ότι τα στοιχεία είναι σωστά'
        );
      },
      complete: () => {

      },
    });
  }

  updateEmployee() {
    this.http
      .put(
        this.apiUrl + 'api/employee/' + this.employee.id,
        this.employee
      )
      .subscribe({
        next: (response) => {
          console.log(response);
          this.toastr.success('Ο υπάλληλος ενημερώθηκε επιτυχώς');
          this.router.navigate(['admin/employees']);
        },
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
        this.apiUrl + 'api/employeedepartment/employee/' + this.employee.id,
        { employeeId: this.employee.id, departmentId: this.department }
      )
      .subscribe({
        next: (response) => {
          console.log(response);
          this.toastr.success('Ο υπάλληλος ενημερώθηκε επιτυχώς');
          this.router.navigate(['admin/employees']);
        },
        error: (error) => {

        },
        complete: () => {
          console.log(this.employee);

        },
      });
  }

  updateManager() {
    if (this.managerUpd == 'manager') {
      if (this.manager) {
        this.http.put(this.apiUrl + 'api/managerdepartment/' + this.manager.id, {
          employeeId: this.employee.id,
          departmentId: this.department ? this.department.id : this.dept.id ? this.dept.id : this.manager.departmentId,
        }).subscribe({
          next: (response) => {
            console.log(response);
            this.toastr.success('Ο υπάλληλος ενημερώθηκε επιτυχώς');
            this.router.navigate(['admin/employees']);
          },
          error: (error) => {
            this.toastr.error(
              error.error.message ??
              'Κάτι πήγε στραβά, σιγουρευτείτε ότι τα στοιχεία είναι σωστά'
            );
          },
          complete: () => {
            console.log(this.employee);

          },
        });
      } else {
        // http://localhost:5044/api/managerdepartment/
        this.http.post(this.apiUrl + 'api/managerdepartment/', {
          employeeId: this.employee.id,
          departmentId: this.department ? this.department.id : this.dept.id ? this.dept.id : this.manager.departmentId,
        }).subscribe({
          next: (response) => {
            console.log(response);
            this.toastr.success('Ο υπάλληλος ενημερώθηκε επιτυχώς');
            this.router.navigate(['admin/employees']);
          },
          error: (error) => {
            this.toastr.error(
              error.error.message ??
              'Κάτι πήγε στραβά, σιγουρευτείτε ότι τα στοιχεία είναι σωστά'
            );
          },
          complete: () => {
            console.log(this.employee);

          },
        });
      }
    } else {
      if (this.manager) {
        if (this.manager.id != null) {
          // http://localhost:5044/api/managerdepartment/
          this.http.delete(this.apiUrl + 'api/managerdepartment/employee/' + this.employee.id).subscribe({
            next: (response) => {
              console.log(response);
              this.toastr.success('Ο υπάλληλος ενημερώθηκε επιτυχώς');
              this.router.navigate(['admin/employees']);
            },
            error: (error) => {
              this.toastr.error(
                error.error.message ??
                'Κάτι πήγε στραβά, σιγουρευτείτε ότι τα στοιχεία είναι σωστά'
              );
            },
            complete: () => {
              console.log("completed");
            },
          });
        }
      }
    }
  }

  deleteEmployee() {
    this.http
      .delete(this.apiUrl + 'api/employee/' + this.employee.id)
      .subscribe({
        next: (response) => {
          console.log(response);
          this.toastr.success('Ο υπάλληλος διαγράφηκε επιτυχώς');
          this.router.navigate(['admin/employees']);
        },
        error: (error) => {
          this.errorHandler.handleError(error);
        },
        complete: () => {

        },
      });
  }
}
