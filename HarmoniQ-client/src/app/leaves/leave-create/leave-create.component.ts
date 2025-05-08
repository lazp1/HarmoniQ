import { HttpClient } from '@angular/common/http';
import { Component, inject, output } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AccountService } from '../../_services/account.service';
import { environment } from '../../../environments/environment';
import { FormsModule } from '@angular/forms';
import { ErrorHandlerService } from '../../_services/error-handler.service';

@Component({
  selector: 'app-leave-create',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './leave-create.component.html'
})
export class LeaveCreateComponent {
  private toastr = inject(ToastrService);
  http = inject(HttpClient);
  department: any = {};
  private router = inject(Router);
  apiUrl = environment.apiUrl;
  leave: any = {};
  employees: any = {};
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
  }

  createLeave() {
    this.leave.status = 'Pending';
    this.http.post(this.apiUrl + 'api/leave/', this.leave).subscribe({
      next: (response) => {
        this.toastr.success('Η άδεια δημιουργήθηκε επιτυχώς');
        this.router.navigate(['admin/leaves']);
      },
      error: (error) => {
        this.toastr.error(
          error.error.message ??
          'Κάτι πήγε στραβά, σιγουρευτείτε ότι τα στοιχεία είναι σωστά'
        );
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
