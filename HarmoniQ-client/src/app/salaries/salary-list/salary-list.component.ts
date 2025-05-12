import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
import { ErrorHandlerService } from '../../_services/error-handler.service';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-salary-list',
  standalone: true,
  imports: [RouterModule, CommonModule],
  providers: [DatePipe],
  templateUrl: './salary-list.component.html'
})
export class SalaryListComponent {
  http = inject(HttpClient);
  salaries: any[] = [];
  apiUrl = environment.apiUrl;
  errorHandler = inject(ErrorHandlerService);

  // Pagination properties
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  constructor(private router: Router) { }

  get paginatedSalaries() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.salaries.slice(startIndex, startIndex + this.itemsPerPage);
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
    this.getSalaries();
  }

  getSalaries() {
    this.http.get(this.apiUrl + 'api/salary').subscribe({
      next: (response) => {
        this.salaries = response as any[];
        this.totalPages = Math.ceil(this.salaries.length / this.itemsPerPage);
      },
      error: (error) => {
        this.errorHandler.handleError(error);
      },
      complete: () => {
      },
    });
  }
}
