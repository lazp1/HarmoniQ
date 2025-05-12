import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Chart from 'chart.js/auto';
import { environment } from '../../environments/environment';
import { ErrorHandlerService } from '../_services/error-handler.service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule, NgFor } from '@angular/common';
import { get } from 'jquery';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    NgFor
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  chart: any = [];
  apiUrl = environment.apiUrl;
  brainApiUrl = environment.brainApiUrl;
  chartStatistics: any;
  chartEmployees: any;
  leavesPending: any;
  chartLeaves: any;
  chartAIService: any;
  employee: any;
  employees = [] as any;
  employeesAIList = [] as any;
  private errorHandler = inject(ErrorHandlerService);

  // Pagination properties
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.getStatistics();

    this.employees = this.http.get(this.apiUrl + 'api/employee')
      .subscribe((response: any) => {
        this.employees = response;

        this.getSuggestionsFromAI();

      });

    this.chartStatistics = this.http.get(this.apiUrl + 'api/dashboard/statistics')
      .subscribe((response: any) => {
        let statsLabels = Object.keys(response);
        const statsData = Object.values(response);

        statsLabels.forEach(element => {
          switch (element) {
            case 'totalEmployees':
              statsLabels[0] = 'Εργαζόμενοι';
              break;
            case 'totalLeaves':
              statsLabels[1] = 'Άδειες';
              break;
            case 'totalManagersDepartments':
              statsLabels[2] = 'Managers';
              break;
            case 'totalSalaries':
              statsLabels[3] = 'Μισθοδοσίες';
              break;
            case 'totalUsers':
              statsLabels[4] = 'Χρήστες';
              break;
            case 'totalDepartments':
              statsLabels[5] = 'Τμήματα';
              break;
            default:
              statsLabels = statsLabels;
          }
        });

        this.chart = new Chart('canvasStatistics', {
          type: 'bar',
          data: {
            labels: statsLabels,
            datasets: [
              {
                label: 'Στατιστικά Δεδομένα',
                data: statsData,
                backgroundColor: 'rgba(102, 120, 255, 0.2)',
                borderColor: 'rgba(102, 120, 255, 1)',
                borderWidth: 1,
                borderRadius: 10,
                borderSkipped: false,
              }
            ]
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });
      });

    this.chartEmployees = this.http.get(this.apiUrl + 'api/dashboard/statistics/employees')
      .subscribe((response: any) => {
        const labels = Array.isArray(response) ? response.map((item: any) => `${item.year}-${item.month}`) : [];
        const data = Array.isArray(response) ? response.map((item: any) => item.totalEmployees) : [];

        this.chart = new Chart('canvasEmployees', {
          type: 'line',
          data: {
            labels: labels,
            datasets: [
              {
                label: 'Εργαζόμενοι ανα μήνα πρόσληψης',
                data: data,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                tension: 0.4
              }
            ]
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });
      });

    this.chartLeaves = this.http.get(this.apiUrl + 'api/dashboard/statistics/leaves')
      .subscribe((response: any) => {
        const labels = Array.isArray(response) ? response.map((item: any) => `${item.year}-${item.month}`) : [];
        const data = Array.isArray(response) ? response.map((item: any) => item.totalLeaves) : [];

        this.chart = new Chart('canvasLeaves', {
          type: 'line',
          data: {
            labels: labels,
            datasets: [
              {
                label: 'Σύνολο Αδειών ανα μήνα',
                data: data,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
                tension: 0.4
              }
            ]
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });
      });

    this.chartAIService = new Chart('canvasAIService', {
      type: 'line',
      data: {
        datasets: [
          {
            label: 'Χρόνος απόκρισης σε milliseconds',
            data: [],
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });

    setInterval(() => {
      const startTime = performance.now();
      this.http.get(this.brainApiUrl + 'health' + '?time=' + performance.now()).subscribe({
        next: () => {
          const endTime = performance.now();
          const responseTime = endTime - startTime;

          if (this.chartAIService && this.chartAIService.data) {
            const currentTime = new Date().toLocaleTimeString();
            this.chartAIService.data.labels.push(currentTime);
            this.chartAIService.data.datasets[0].data.push(responseTime);

            if (this.chartAIService.data.labels.length > 100) {
              this.chartAIService.data.labels.shift();
              this.chartAIService.data.datasets[0].data.shift();
            }

            this.chartAIService.update();
          }
        },
        error: () => {
          if (this.chartAIService && this.chartAIService.data) {
            const currentTime = new Date().toLocaleTimeString();
            this.chartAIService.data.labels.push(currentTime);
            this.chartAIService.data.datasets[0].data.push(0);

            if (this.chartAIService.data.labels.length > 100) {
              this.chartAIService.data.labels.shift();
              this.chartAIService.data.datasets[0].data.shift();
            }

            this.chartAIService.update();
          }
        }
      });
    }, 1000);
  }

  getStatistics() {
    this.http.get<any>(this.apiUrl + 'api/dashboard/statistics/leavespending').subscribe({
      next: (response) => (this.leavesPending = response),
      error: (error) => {
        this.errorHandler.handleError(error);
      },
      complete: () => {
      },
    });
  }

  getEmployeeData(id: number) {
    return this.http.get(this.apiUrl + 'api/employee/' + id);
  }

  getSuggestionsFromAI() {
    this.http.post(this.brainApiUrl + 'suggestions', this.employees).subscribe({
      next: (response) => {
        this.employeesAIList = response;
        this.totalPages = Math.ceil(this.employeesAIList.length / this.itemsPerPage);
        this.currentPage = 1;

        for (let i = 0; i < this.employeesAIList.length; i++) {
          this.getEmployeeData(this.employeesAIList[i].id).subscribe({
            next: (employee: any) => {
              this.employeesAIList[i].firstName = employee.firstName;
              this.employeesAIList[i].lastName = employee.lastName;
              this.employeesAIList[i].email = employee.email;
            },
            error: (error) => {
              this.errorHandler.handleError(error);
            }
          });
        }
      },
      error: (error) => {
        this.errorHandler.handleError(error);
      }
    });
  }

  get paginatedEmployees() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.employeesAIList.slice(startIndex, startIndex + this.itemsPerPage);
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
}
