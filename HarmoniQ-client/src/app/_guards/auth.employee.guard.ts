import { CanActivateFn, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { inject } from '@angular/core';

export const authEmployeeGuard: CanActivateFn = (route, state) => {
    const toastr = inject(ToastrService);
    const router = inject(Router);
    const role = localStorage.getItem('userRole');

    if (role === "User") {
        return true;
    } 
    
    toastr.error('Πρέπει να είστε υπάλληλος για να έχετε πρόσβαση');
    // Redirect to appropriate dashboard based on role
    if (role === "Admin") {
        void router.navigate(['/admin/dashboard']);
    } else if (role === "Manager") {
        void router.navigate(['/manager/dashboard']);
    }
    return false;
};
