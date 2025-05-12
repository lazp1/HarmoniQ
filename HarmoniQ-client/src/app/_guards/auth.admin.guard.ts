import { CanActivateFn, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { inject } from '@angular/core';

export const authAdminGuard: CanActivateFn = (route, state) => {
    const toastr = inject(ToastrService);
    const router = inject(Router);
    const role = localStorage.getItem('userRole');

    if (role === "Admin") {
        return true;
    }
    
    toastr.error('Πρέπει να είστε διαχειριστής για να έχετε πρόσβαση');
    // Redirect to appropriate dashboard based on role
    if (role === "Manager") {
        void router.navigate(['/manager/dashboard']);
    } else if (role === "User") {
        void router.navigate(['/employee/dashboard']);
    }
    return false;
};
