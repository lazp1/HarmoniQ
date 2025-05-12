import { CanActivateFn, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { inject } from '@angular/core';

export const authManagerGuard: CanActivateFn = (route, state) => {
    const toastr = inject(ToastrService);
    const router = inject(Router);
    const role = localStorage.getItem('userRole');

    if (role === "Manager") {
        return true;
    }

    toastr.error('Πρέπει να είστε manager για να έχετε πρόσβαση');
    // Redirect to appropriate dashboard based on role
    if (role === "Admin") {
        void router.navigate(['/admin/dashboard']);
    } else if (role === "User") {
        void router.navigate(['/employee/dashboard']);
    }
    return false;
};
