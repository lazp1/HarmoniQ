import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs/operators';
import { EmailService } from '../../_services/email.service';
import { DepartmentService } from '../../_services/department.service';
import { Department } from '../../_models/department.model';
import { BulkEmailRequest } from '../../_models/bulk-email.model';

@Component({
  selector: 'app-bulk-email-modal',
  templateUrl: './bulk-email-modal.component.html',
  styleUrls: ['./bulk-email-modal.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class BulkEmailModalComponent implements OnInit {
  @Input() isAdmin = false;
  @Input() userDepartmentId?: number;
  
  emailForm!: FormGroup;
  departments: Department[] = [];
  loading = false;
  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private modal: NgbActiveModal,
    private departmentService: DepartmentService,
    private emailService: EmailService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.emailForm = this.formBuilder.group({
      departmentIds: [[]],
      subject: ['', Validators.required],
      body: ['', Validators.required],
      isHtml: [false]
    });

    // Load departments
    this.loadDepartments();

    if (!this.isAdmin && this.userDepartmentId) {
      // For managers, set their department ID by default and disable selection
      this.emailForm.patchValue({
        departmentIds: [this.userDepartmentId]
      });
      this.emailForm.get('departmentIds')?.disable();
    }
  }

  loadDepartments() {
    this.departmentService.getAllDepartments()
      .pipe(first())
      .subscribe({
        next: (departments: Department[]) => {
          if (this.isAdmin) {
            this.departments = departments;
          } else {
            // Filter to show only user's department
            this.departments = departments.filter(d => d.id === this.userDepartmentId);
          }
        },
        error: (error: any) => {
          this.toastr.error('Σφάλμα κατά την φόρτωση των τμημάτων');
          console.error('Error loading departments:', error);
        }
      });
  }

  onSubmit() {
    this.submitted = true;

    if (this.emailForm.invalid) {
      return;
    }

    this.loading = true;
    const formData = this.emailForm.getRawValue() as BulkEmailRequest;
    
    // For managers, ensure only their department is selected
    if (!this.isAdmin && this.userDepartmentId) {
      formData.departmentIds = [this.userDepartmentId];
    }

    this.emailService.sendBulkEmail(formData)
      .pipe(first())
      .subscribe({
        next: () => {
          this.toastr.success('Τα emails στάλθηκαν με επιτυχία');
          this.modal.close(true);
        },
        error: (error: any) => {
          this.toastr.error('Σφάλμα κατά την αποστολή των emails');
          console.error('Error sending emails:', error);
          this.loading = false;
        }
      });
  }

  dismiss() {
    this.modal.dismiss();
  }
}
