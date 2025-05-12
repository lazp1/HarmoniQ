import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { environment } from '../../environments/environment';
import { AccountService } from '../_services/account.service';
import { ToastrService } from 'ngx-toastr';

interface RemainingLeavesResponse {
  totalAllowedLeaves: number;
  usedLeaves: number;
  remainingLeaves: number;
}

interface EmployeeIdResponse {
  employeeId: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardUserComponent implements OnInit {
  http = inject(HttpClient);
  accountService = inject(AccountService);
  toastr = inject(ToastrService);
  apiUrl = environment.apiUrl;
  remainingLeaves: number = 0;
  totalAllowedLeaves: number = 21;
  usedLeaves: number = 0;
  currentUser: any;
  employeeId: number | null = null;
  myLeaves: any[] = [];
  showModal = false;

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  // New leave form data
  newLeave = {
    employeeId: 0,
    startDate: '',
    endDate: '',
    reason: '',
    status: 'Pending'
  };

  // Status mappings
  statusTranslations: { [key: string]: string } = {
    'Pending': 'Αναμονή έγκρισης',
    'Approved': 'Εγκεκριμένη',
    'Rejected': 'Ακυρωμένη'
  };

  get paginatedLeaves() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.myLeaves.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get pages() {
    const pagesArray = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pagesArray.push(i);
    }
    return pagesArray;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Pending': return 'text-warning';
      case 'Approved': return 'text-success';
      case 'Rejected': return 'text-danger';
      default: return '';
    }
  }

  getStatusTranslation(status: string): string {
    return this.statusTranslations[status as keyof typeof this.statusTranslations] || status;
  }

  ngOnInit(): void {
    const userString = localStorage.getItem('user');
    if (userString) {
      const userData = JSON.parse(userString);
      this.currentUser = userData.user;
      this.getEmployeeId();
    }
  }

  private getEmployeeId(): void {
    if (this.currentUser?.id) {
      this.http.get<EmployeeIdResponse>(`${this.apiUrl}api/user/employee/${this.currentUser.id}`)
        .subscribe({
          next: (response) => {
            this.employeeId = response.employeeId;
            this.loadRemainingLeaves();
            this.loadMyLeaves();
          },
          error: (error) => {
            console.error('Error fetching employee ID:', error);
          }
        });
    }
  }

  private loadRemainingLeaves(): void {
    if (this.employeeId) {
      this.http.get<RemainingLeavesResponse>(`${this.apiUrl}api/leave/remaining/${this.employeeId}`)
        .subscribe({
          next: (response: RemainingLeavesResponse) => {
            console.log('Leave details:', response);
            this.remainingLeaves = response.remainingLeaves;
            this.totalAllowedLeaves = response.totalAllowedLeaves;
            this.usedLeaves = response.usedLeaves;
          },
          error: (error: Error) => {
            console.error('Error fetching remaining leaves:', error);
          }
        });
    }
  }

  private loadMyLeaves(): void {
    if (this.employeeId) {
      this.http.get<any[]>(`${this.apiUrl}api/leave`)
        .subscribe({
          next: (response) => {
            // Filter leaves for current employee
            this.myLeaves = response
              .filter((leave: any) => leave.employeeId === this.employeeId)
              .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()); // Sort by date, newest first
            this.totalPages = Math.ceil(this.myLeaves.length / this.itemsPerPage);
          },
          error: (error) => {
            console.error('Error fetching leaves:', error);
          }
        });
    }
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  cancelLeave(leaveId: number) {
    if (confirm('Είστε σίγουροι ότι θέλετε να ακυρώσετε την άδεια;')) {
      // First get the current leave to maintain all other properties
      this.http.get(`${this.apiUrl}api/leave/${leaveId}`).subscribe({
        next: (leave: any) => {
          // Update only the status to Rejected
          const updatedLeave = { ...leave, status: 'Rejected' };
          this.http.put(`${this.apiUrl}api/leave/${leaveId}`, updatedLeave).subscribe({
            next: () => {
              this.toastr.success('Η άδεια ακυρώθηκε με επιτυχία');
              this.loadMyLeaves();
              this.loadRemainingLeaves();
            },
            error: (error) => {
              this.toastr.error('Σφάλμα κατά την ακύρωση της άδειας');
              console.error('Error canceling leave:', error);
            }
          });
        },
        error: (error) => {
          this.toastr.error('Σφάλμα κατά την ακύρωση της άδειας');
          console.error('Error fetching leave:', error);
        }
      });
    }
  }

  openModal(): void {
    this.showModal = true;
    this.newLeave.employeeId = this.employeeId || 0;
  }

  closeModal(): void {
    this.showModal = false;
    // Reset form
    this.newLeave = {
      employeeId: 0,
      startDate: '',
      endDate: '',
      reason: '',
      status: 'Pending'
    };
  }

  submitLeave(): void {
    if (!this.newLeave.startDate || !this.newLeave.endDate || !this.newLeave.reason) {
      this.toastr.error('Παρακαλώ συμπληρώστε όλα τα πεδία');
      return;
    }

    this.http.post(`${this.apiUrl}api/leave`, this.newLeave)
      .subscribe({
        next: (response) => {
          this.toastr.success('Η άδεια καταχωρήθηκε με επιτυχία');
          this.closeModal();
          this.loadRemainingLeaves();
          this.loadMyLeaves();
        },
        error: (error) => {
          this.toastr.error('Σφάλμα κατά την καταχώρηση της άδειας');
          console.error('Error submitting leave:', error);
        }
      });
  }
}
