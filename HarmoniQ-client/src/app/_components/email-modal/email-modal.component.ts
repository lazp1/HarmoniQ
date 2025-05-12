import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DepartmentService } from '../../_services/department.service';
import { EmailService } from '../../_services/email.service';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-email-modal',
  templateUrl: './email-modal.component.html',
  styleUrls: ['./email-modal.component.css']
})
export class EmailModalComponent implements OnInit {
  emailForm!: FormGroup;
  departments: any[] = [];
  loading = false;
  isAdmin = false;
  userDepartmentId?: number;
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

    // Check if user is admin
    const userRole = localStorage.getItem('userRole');
    this.isAdmin = userRole === 'Admin';
    this.userDepartmentId = Number(localStorage.getItem('departmentId'));
  }

  loadDepartments() {
    this.departmentService.getAllDepartments()
      .pipe(first())
      .subscribe({
        next: (departments) => {
          if (this.isAdmin) {
            this.departments = departments;
          } else {
            // Filter to show only user's department
            this.departments = departments.filter(d => d.id === this.userDepartmentId);
          }
        },
        error: error => {
          this.toastr.error('Error loading departments');
        }
      });
  }

  onSubmit() {
    this.submitted = true;

    if (this.emailForm.invalid) {
      return;
    }

    this.loading = true;
    const formData = this.emailForm.value;
    
    // Convert single department ID to array if necessary
    if (!this.isAdmin && this.userDepartmentId) {
      formData.departmentIds = [this.userDepartmentId];
    }

    this.emailService.sendBulkEmail(formData)
      .pipe(first())
      .subscribe({
        next: () => {
          this.toastr.success('Emails sent successfully');
          this.modal.close(true);
        },
        error: error => {
          this.toastr.error('Failed to send emails');
          this.loading = false;
        }
      });
  }

  dismiss() {
    this.modal.dismiss();
  }
}
