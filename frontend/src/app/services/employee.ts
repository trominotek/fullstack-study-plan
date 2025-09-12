import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  zip_code: string;
  department_id?: number;
}

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private http = inject(HttpClient);
  private base = '/api/employee';

  getAll(): Observable<Employee[]> { return this.http.get<Employee[]>(this.base); }
  create(body: Partial<Employee>): Observable<Employee> { return this.http.post<Employee>(this.base, body); }
  delete(id: number): Observable<{ deleted_id: number }> { return this.http.delete<{ deleted_id: number }>(`${this.base}/${id}`); }

  // convenience to populate the select
  getDepartments() { return this.http.get<{ id: number; name: string }[]>('/api/department'); }
}
