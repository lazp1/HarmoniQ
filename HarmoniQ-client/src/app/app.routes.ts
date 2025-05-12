import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { EmployeeListComponent } from './employees/employee-list/employee-list.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { authGuard } from './_guards/auth.guard';
import { authAdminGuard } from './_guards/auth.admin.guard';
import { authManagerGuard } from './_guards/auth.manager.guard';
import { authEmployeeGuard } from './_guards/auth.employee.guard';
import { authGuestGuard } from './_guards/auth.guest.guard';
import { DepartmentListComponent } from './departments/department-list/department-list.component';
import { DepartmentEditComponent } from './departments/department-edit/department-edit.component';
import { DepartmentCreateComponent } from './departments/department-create/department-create.component';
import { DepartmentViewComponent } from './departments/department-view/department-view.component';
import { EmployeeEditComponent } from './employees/employee-edit/employee-edit.component';
// import { EmployeeCreateComponent } from './employees/employee-create/employee-create.component';
import { EmployeeViewComponent } from './employees/employee-view/employee-view.component';
import { UserListComponent } from './users/user-list/user-list.component';
import { UserEditComponent } from './users/user-edit/user-edit.component';
import { DashboardUserComponent } from './dashboard-user/dashboard.component';
import { DashboardManagerComponent } from './dashboard-manager/dashboard.component';
import { LeaveListComponent } from './leaves/leave-list/leave-list.component';
import { SalaryEditComponent } from './salaries/salary-edit/salary-edit.component';
import { LeaveViewComponent } from './leaves/leave-view/leave-view.component';
import { LeaveEditComponent } from './leaves/leave-edit/leave-edit.component';
import { SalaryListComponent } from './salaries/salary-list/salary-list.component';
import { LeaveCreateComponent } from './leaves/leave-create/leave-create.component';
import { SalaryCreateComponent } from './salaries/salary-create/salary-create.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [authGuestGuard] },
  {
    path: 'admin',
    runGuardsAndResolvers: 'always',
    canActivate: [authGuard],
    children: [
      {
        path: 'departments',
        canActivate: [authAdminGuard],
        component: DepartmentListComponent,
      },
      {
        path: 'departments/create',
        canActivate: [authAdminGuard],
        component: DepartmentCreateComponent,
      },
      {
        path: 'departments/:id',
        canActivate: [authAdminGuard],
        component: DepartmentViewComponent,
      },
      {
        path: 'departments/:id/edit',
        canActivate: [authAdminGuard],
        component: DepartmentEditComponent,
      },
      {
        path: 'employees',
        canActivate: [authAdminGuard],
        component: EmployeeListComponent,
      },
      {
        path: 'employees/:id',
        canActivate: [authAdminGuard],
        component: EmployeeViewComponent,
      },
      {
        path: 'employees/:id/edit',
        canActivate: [authAdminGuard],
        component: EmployeeEditComponent,
      },
      {
        path: 'users',
        canActivate: [authAdminGuard],
        component: UserListComponent,
      },
      {
        path: 'users/:id/edit',
        canActivate: [authAdminGuard],
        component: UserEditComponent,
      },
      {
        path: 'leaves',
        canActivate: [authAdminGuard],
        component: LeaveListComponent,
      },
      {
        path: 'leaves/create',
        canActivate: [authAdminGuard],
        component: LeaveCreateComponent,
      },
      {
        path: 'leaves/:id',
        canActivate: [authAdminGuard],
        component: LeaveViewComponent,
      },
      {
        path: 'leaves/:id/edit',
        canActivate: [authAdminGuard],
        component: LeaveEditComponent,
      },
      {
        path: 'salaries',
        canActivate: [authAdminGuard],
        component: SalaryListComponent,
      },
      {
        path: 'salaries/create',
        canActivate: [authAdminGuard],
        component: SalaryCreateComponent,
      },
      {
        path: 'salaries/:id/edit',
        canActivate: [authAdminGuard],
        component: SalaryEditComponent,
      },
      {
        path: 'dashboard',
        canActivate: [authAdminGuard],
        component: DashboardComponent,
      },
    ],
  },
  {
    path: 'manager',
    runGuardsAndResolvers: 'always',
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        canActivate: [authManagerGuard],
        component: DashboardManagerComponent,
      },
      {
        path: 'leaves',
        canActivate: [authManagerGuard],
        component: DashboardUserComponent, // Reuse employee dashboard for personal leaves
      },
    ],
  },
  {
    path: 'employee',
    runGuardsAndResolvers: 'always',
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        canActivate: [authEmployeeGuard],
        component: DashboardUserComponent,
      },
    ],
  },
  { path: '**', component: HomeComponent, pathMatch: 'full' },
];
