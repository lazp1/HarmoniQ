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
  salaries: any;
  apiUrl = environment.apiUrl;
  errorHandler = inject(ErrorHandlerService);
  constructor(private router: Router) { }



  ngOnInit(): void {
    this.getSalaries();
  }

  getSalaries() {
    this.http.get(this.apiUrl + 'api/salary').subscribe({
      next: (response) => (this.salaries = response),
      error: (error) => {
        this.errorHandler.handleError(error);
      },
      complete: () => {

      },
    });
  }
}
