import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { environment } from '../../environments/environment';
import { AccountService } from '../_services/account.service';
import { ToastrService } from 'ngx-toastr';

interface DepartmentLeaves {
  pending: number;
  approved: number;
  rejected: number;
  leaves: any[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardManagerComponent implements OnInit {
  http = inject(HttpClient);
  accountService = inject(AccountService);
  toastr = inject(ToastrService);
  apiUrl = environment.apiUrl;
  currentUser: any;
  departmentId: number | null = null;
  departmentLeaves: DepartmentLeaves = {
    pending: 0,
    approved: 0,
    rejected: 0,
    leaves: []
  };

  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  statusTranslations: { [key: string]: string } = {
    'Pending': 'Αναμονή έγκρισης',
    'Approved': 'Εγκεκριμένη',
    'Rejected': 'Ακυρωμένη'
  };

  get paginatedLeaves() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.departmentLeaves.leaves.slice(startIndex, startIndex + this.itemsPerPage);
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
      this.getManagerDepartment();
    }
  }

  private getManagerDepartment(): void {
    if (!this.currentUser?.id) {
      console.error('No current user ID found');
      this.toastr.error('Δεν βρέθηκε ο χρήστης');
      return;
    }

    // First get the employee ID from the user ID
    this.http.get<any>(`${this.apiUrl}api/user/employee/${this.currentUser.id}`)
      .subscribe({
        next: (response) => {
          console.log('User to employee mapping:', response);
          const employeeId = response.employeeId;
          
          // Then get the manager's department using the employee ID
          this.http.get<any[]>(`${this.apiUrl}api/managerdepartment/employee/${employeeId}`)
            .subscribe({
              next: (response) => {
                console.log('Manager department response:', response);
                if (response && response.length > 0) {
                  const dept = response[0];
                  this.departmentId = dept.departmentId;
                  console.log(`Found department: ${dept.departmentName} (ID: ${this.departmentId})`);
                  this.loadDepartmentLeaves();
                } else {
                  console.error('No department found in response for manager employee:', employeeId);
                  this.toastr.error('Δεν βρέθηκε το τμήμα σας');
                }
              },
              error: (error) => {
                console.error('Error details:', error);
                if (error.error?.message) {
                  this.toastr.error(error.error.message);
                } else {
                  this.toastr.error('Σφάλμα κατά την λήψη του τμήματος');
                }
              }
            });
        },
        error: (error) => {
          console.error('Error getting employee ID:', error);
          this.toastr.error('Σφάλμα κατά την λήψη των στοιχείων εργαζομένου');
        }
      });
  }

  private async loadDepartmentLeaves(): Promise<void> {
    if (!this.departmentId) {
      console.error('No department ID available');
      return;
    }

    try {
      console.log('Loading leaves for department:', this.departmentId);

      // Get employee-department mappings
      const empDeptResponse = await this.http.get<any[]>(`${this.apiUrl}api/employeedepartment`).toPromise();
      if (!empDeptResponse) {
        throw new Error('Failed to fetch employee-department mappings');
      }

      // Get my employee ID
      const userResponse = await this.http.get<any>(`${this.apiUrl}api/user/employee/${this.currentUser.id}`).toPromise();
      const myEmployeeId = userResponse.employeeId;

      // Get employee IDs from this department
      const departmentEmployeeIds = empDeptResponse
        .filter(ed => ed.departmentId === this.departmentId)
        .map(ed => ed.employeeId);

      console.log('Found employees in department:', departmentEmployeeIds);

      if (departmentEmployeeIds.length === 0) {
        console.warn('No employees found in department:', this.departmentId);
        this.departmentLeaves = {
          pending: 0,
          approved: 0,
          rejected: 0,
          leaves: []
        };
        return;
      }

      // Get all leaves
      const leavesResponse = await this.http.get<any[]>(`${this.apiUrl}api/leave`).toPromise();
      if (!leavesResponse) {
        throw new Error('Failed to fetch leaves');
      }

      // Filter and sort leaves for department employees, excluding my own leaves
      const departmentLeaves = leavesResponse
        .filter(leave => {
          const isInDepartment = departmentEmployeeIds.includes(leave.employeeId);
          const isNotMyLeave = leave.employeeId !== myEmployeeId;
          console.log(`Leave ${leave.id} by employee ${leave.employeeId} in department: ${isInDepartment}, is my leave: ${!isNotMyLeave}`);
          return isInDepartment && isNotMyLeave;
        })
        .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

      console.log('Filtered department leaves:', departmentLeaves);

      // Update state
      this.departmentLeaves = {
        leaves: departmentLeaves,
        pending: departmentLeaves.filter(l => l.status === 'Pending').length,
        approved: departmentLeaves.filter(l => l.status === 'Approved').length,
        rejected: departmentLeaves.filter(l => l.status === 'Rejected').length
      };

      // Update pagination
      this.totalPages = Math.ceil(departmentLeaves.length / this.itemsPerPage);
      this.currentPage = 1;

    } catch (error) {
      console.error('Error loading department leaves:', error);
      this.toastr.error('Σφάλμα κατά την λήψη των αδειών');
    }
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  updateLeaveStatus(leaveId: number, newStatus: 'Approved' | 'Rejected'): void {
    if (confirm(`Είστε σίγουροι ότι θέλετε να ${newStatus === 'Approved' ? 'εγκρίνετε' : 'απορρίψετε'} την άδεια;`)) {
      this.http.get(`${this.apiUrl}api/leave/${leaveId}`).subscribe({
        next: (leave: any) => {
          const updatedLeave = { ...leave, status: newStatus };
          this.http.put(`${this.apiUrl}api/leave/${leaveId}`, updatedLeave).subscribe({
            next: () => {
              this.toastr.success(`Η άδεια ${newStatus === 'Approved' ? 'εγκρίθηκε' : 'απορρίφθηκε'} με επιτυχία`);
              this.loadDepartmentLeaves();
            },
            error: (error) => {
              this.toastr.error(`Σφάλμα κατά την ${newStatus === 'Approved' ? 'έγκριση' : 'απόρριψη'} της άδειας`);
              console.error('Error updating leave:', error);
            }
          });
        },
        error: (error) => {
          this.toastr.error('Σφάλμα κατά την επεξεργασία της άδειας');
          console.error('Error fetching leave:', error);
        }
      });
    }
  }
}
