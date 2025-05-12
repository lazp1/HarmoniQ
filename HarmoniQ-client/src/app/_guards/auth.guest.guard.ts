import { CanActivateFn, Router } from '@angular/router';
import { AccountService } from '../_services/account.service';
import { inject } from '@angular/core';

export const authGuestGuard: CanActivateFn = (route, state) => {
  const accountService = inject(AccountService);
  const router = inject(Router);

  if (!accountService.currentUser()) {
    return true;
  }

  // If user is logged in, redirect them to their appropriate dashboard
  const userRole = localStorage.getItem('userRole');
  if (userRole === 'Admin') {
    router.navigateByUrl('/admin/dashboard');
  } else if (userRole === 'Manager') {
    router.navigateByUrl('/manager/dashboard');
  } else {
    router.navigateByUrl('/employee/dashboard');
  }

  return false;
};
