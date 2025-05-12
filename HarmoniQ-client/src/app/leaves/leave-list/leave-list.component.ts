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

  leaves: any[] = [];
  employee: any;

  // Pagination properties
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  get paginatedLeaves() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.leaves.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get pages() {
    const pagesArray = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pagesArray.push(i);
    }
    return pagesArray;
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  ngOnInit(): void {
    this.getLeaves();
  }

  getLeaves() {
    this.http.get(this.apiUrl + 'api/leave').subscribe({
      next: (response) => {
        this.leaves = response as any[];
        this.totalPages = Math.ceil(this.leaves.length / this.itemsPerPage);
      },
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
