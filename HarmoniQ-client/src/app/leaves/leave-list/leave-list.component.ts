import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonModule, DatePipe, NgStyle } from '@angular/common';
import { environment } from '../../../environments/environment';
import { AccountService } from '../../_services/account.service';
import { ErrorHandlerService } from '../../_services/error-handler.service';

@Component({
  selector: 'app-leave-list',
  standalone: true,
  imports: [RouterModule, CommonModule, NgStyle],
  providers: [DatePipe],
  templateUrl: './leave-list.component.html'
})
export class LeaveListComponent {
  http = inject(HttpClient);
  private toastr = inject(ToastrService);
  apiUrl = environment.apiUrl;
  accountService = inject(AccountService);
  private router = inject(Router);
  errorHandler = inject(ErrorHandlerService);

  leaves: any;
  employee: any;

  ngOnInit(): void {
    this.getLeaves();
  }

  getLeaves() {
    this.http.get(this.apiUrl + 'api/leave').subscribe({
      next: (response) => (this.leaves = response),
      error: (error) => {
        this.errorHandler.handleError(error);
      },
      complete: () => {

      },
    });
  }

  getEmployee(id: number) {
    this.http.get(this.apiUrl + 'api/employee/' + id).subscribe({
      next: (response) => (this.employee = response),
      error: (error) => {
        this.errorHandler.handleError(error);
      },
      complete: () => {

      },
    });
  }
}
