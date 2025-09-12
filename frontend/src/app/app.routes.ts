import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'employees' },
  {
    path: 'employees',
    loadComponent: () =>
      import('./components/employees/employees.component').then(m => m.EmployeesComponent),
  },
  {
    path: 'departments',
    loadComponent: () =>
      import('./components/departments/departments.component').then(m => m.DepartmentsComponent),
  },
  { path: '**', redirectTo: 'employees' },
];
