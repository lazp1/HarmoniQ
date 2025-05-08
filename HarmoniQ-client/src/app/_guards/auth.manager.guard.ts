import { CanActivateFn } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { inject } from '@angular/core';

export const authManagerGuard: CanActivateFn = (route, state) => {
    const toastr = inject(ToastrService);
    let role = localStorage.getItem('userRole');

    role = role ? role.replace(/"/g, '') : null;

    // console.log(cleanedUserRole);
    if (role == "Manager") {
        return true;
    } else {
        toastr.error('Πρέπει να είστε manager για να έχετε πρόσβαση');
        return false;
    }

    return false;
};
