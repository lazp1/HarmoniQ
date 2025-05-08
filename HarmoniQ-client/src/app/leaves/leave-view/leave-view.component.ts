import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonModule, DatePipe } from '@angular/common';
import { environment } from '../../../environments/environment';
import { AccountService } from '../../_services/account.service';

@Component({
  selector: 'app-leave-view',
  standalone: true,
  imports: [RouterModule, CommonModule],
  providers: [DatePipe],
  templateUrl: './leave-view.component.html'
})
export class LeaveViewComponent {
  private toastr = inject(ToastrService);
  http = inject(HttpClient);
  private router = inject(Router);
  dept: any = {};
  apiUrl = environment.apiUrl;
  manager: any = {};
  leave: any = {};
  accountService = inject(AccountService);

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
    this.http
      .get(this.apiUrl + 'api/leave/' + this.leave)
      .subscribe({
        next: (response) => (this.leave = response),
        error: (error) => {
          if (error.status == 401) {
            localStorage.removeItem('user');
            localStorage.removeItem('userRole');
            this.accountService.currentUser.set(null);
            this.router.navigate(['admin/leaves']);
            this.toastr.error(
              error.error.message ??
              'Η περίοδος σύνδεσης σας έχει λήξει, παρακαλώ συνδεθείτε ξανά'
            );
          }
          this.toastr.error(
            error.error.message ??
            'Κάτι πήγε στραβά, σιγουρευτείτε ότι τα στοιχεία είναι σωστά'
          );
        },
        complete: () => {
          console.log('Leave loaded');
        },
      });
  }

}
