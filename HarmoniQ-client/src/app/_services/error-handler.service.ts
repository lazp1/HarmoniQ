import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { AccountService } from "./account.service";
import { inject, Injectable } from "@angular/core";


@Injectable({
    providedIn: 'root',
})
export class ErrorHandlerService {
    private toastr = inject(ToastrService);
    private router = inject(Router);
    private accountService = inject(AccountService);

    handleError(error: any) {
        if (error.status === 401) {
            localStorage.removeItem('user');
            localStorage.removeItem('userRole');
            this.accountService.currentUser.set(null);
            this.router.navigate(['/']);
            this.toastr.error(
                error.error.message ?? 'Η περίοδος σύνδεσης σας έχει λήξει, παρακαλώ συνδεθείτε ξανά'
            );
        } else {
            this.toastr.error(
                error.error.message ?? 'Κάτι πήγε στραβά, σιγουρευτείτε ότι τα στοιχεία είναι σωστά'
            );
        }
    }
}