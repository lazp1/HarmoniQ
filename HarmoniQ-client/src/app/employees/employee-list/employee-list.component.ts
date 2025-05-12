import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Router, RouterModule } from '@angular/router';
import { AccountService } from '../../_services/account.service';
import { ToastrService } from 'ngx-toastr';
import { ErrorHandlerService } from '../../_services/error-handler.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './employee-list.component.html'
})
export class EmployeeListComponent {
  http = inject(HttpClient);
  accountService = inject(AccountService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  employees: any[] = [];
  apiUrl = environment.apiUrl;
  registerMode = false;
  private errorHandler = inject(ErrorHandlerService);

  // Pagination properties
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  get paginatedEmployees() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.employees.slice(startIndex, startIndex + this.itemsPerPage);
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
    this.getEmployees();
  }

  getEmployees() {
    this.http.get(this.apiUrl + 'api/employee').subscribe({
      next: (response) => {
        this.employees = response as any[];
        this.totalPages = Math.ceil(this.employees.length / this.itemsPerPage);
      },
      error: (error) => {
        this.errorHandler.handleError(error);
      },
      complete: () => {
      },
    });
  }
}
