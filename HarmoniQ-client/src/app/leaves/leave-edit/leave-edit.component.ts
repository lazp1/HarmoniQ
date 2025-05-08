import { HttpClient } from '@angular/common/http';
import { Component, inject, output } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-leave-edit',
  standalone: true,
  imports: [FormsModule, CommonModule],
  providers: [DatePipe],
  templateUrl: './leave-edit.component.html'
})
export class LeaveEditComponent {
  private router = inject(Router);
  private toastr = inject(ToastrService);
  http = inject(HttpClient);
  apiUrl = environment.apiUrl;
  leave: any = {};
  employee: any;

  constructor() {
    const route = inject(ActivatedRoute);
    route.params.subscribe((params) => {
      this.leave = +params['id'];
    });
  }

  ngOnInit(): void {
    this.getLeave();
  }

  getLeave() {
    this.http.get(this.apiUrl + 'api/leave/' + this.leave).subscribe({
      next: (response) => {
        this.leave = response;
      },
      error: (error) => {
        this.toastr.error('Η άδεια δεν βρέθηκε');
        this.router.navigate(['admin/leaves']);
      },
    });
  }

  updateLeave() {
    this.http.put(this.apiUrl + 'api/leave/' + this.leave.id, this.leave).subscribe({
      next: (response) => {
        this.toastr.success('Η άδεια ενημερώθηκε');
        this.router.navigate(['admin/leaves']);
      },
      error: (error) => {
        this.toastr.error('Η άδεια δεν ενημερώθηκε');
      },
    });
  }


}
