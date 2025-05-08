import { HttpClient } from '@angular/common/http';
import { Component, inject, output } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgFor } from '@angular/common';
import { AccountService } from '../../_services/account.service';
import { environment } from '../../../environments/environment';
import { ErrorHandlerService } from '../../_services/error-handler.service';

@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [FormsModule, NgFor],
  templateUrl: './user-edit.component.html'
})
export class UserEditComponent {
  private toastr = inject(ToastrService);
  http = inject(HttpClient);
  private router = inject(Router);
  private errorHandler = inject(ErrorHandlerService);
  user: any;
  accountService = inject(AccountService);
  apiUrl = environment.apiUrl;

  constructor() {
    const route = inject(ActivatedRoute);
    route.params.subscribe((params) => {
      this.user = +params['id'];
    });
  }

  ngOnInit(): void {
    this.getUser();
  }

  getUser() {
    this.http
      .get(this.apiUrl + 'api/user/' + this.user)
      .subscribe({
        next: (response) => (this.user = response),
        error: (error) => {
          this.errorHandler.handleError(error);
        },
        complete: () => {

        },
      });
  }

  updateUser() {
    this.http
      .put(this.apiUrl + 'api/user/' + this.user.id, this.user)
      .subscribe({
        next: (response) => {
          this.toastr.success('Επιτυχής ενημέρωση');
          this.router.navigate(['admin/users']);
        },
        error: (error) => {
          this.errorHandler.handleError(error);
        },
        complete: () => {

        },
      });
  }
}
