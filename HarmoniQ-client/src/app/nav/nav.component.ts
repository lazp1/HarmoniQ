import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../_services/account.service';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BsDropdownModule,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css',
})
export class NavComponent {
  showNav: boolean = false;
  currentUser: any;
  userFullName: any;

  onToggleNav() {
    this.showNav = !this.showNav;
  }

  accountService = inject(AccountService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  model: any = {};

  constructor() {
    let current: any = this.accountService.currentUser;
    if (current.firstName === undefined || current.lastName === undefined) {
      this.userFullName = this.accountService.currentUser()?.user?.email;
    } else {
      this.userFullName = current?.firstName + ' ' + current?.lastName;
    }
  }

  login() {
    this.accountService.login(this.model).subscribe({
      next: () => {
        void this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.toastr.error(error.error.message);
      },
      complete: () => {
        console.log('complete');
      },
    });
  }

  logout() {
    this.accountService.logout();
    this.router.navigate(['/']);
  }
}
