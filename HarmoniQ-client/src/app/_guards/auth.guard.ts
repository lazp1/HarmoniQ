import { CanActivateFn } from '@angular/router';
import { AccountService } from '../_services/account.service';
import { ToastrService } from 'ngx-toastr';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const accountService = inject(AccountService);
  const toastr = inject(ToastrService);

  const user = accountService.currentUser();
  if (!user) {
    toastr.error('Πρέπει να συνδεθείτε για να έχετε πρόσβαση');
    return false;
  }

  return true;
};
