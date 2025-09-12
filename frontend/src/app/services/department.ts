import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Department {
  id: number;
  name: string;
  description: string;
}

@Injectable({ providedIn: 'root' })
export class DepartmentService {
  private http = inject(HttpClient);
  private base = '/api/department';

  getAll(): Observable<Department[]> { return this.http.get<Department[]>(this.base); }
  create(body: Partial<Department>): Observable<Department> { return this.http.post<Department>(this.base, body); }
  delete(id: number): Observable<{ deleted_id: number }> { return this.http.delete<{ deleted_id: number }>(`${this.base}/${id}`); }
  update(id: number, body: Partial<Department>): Observable<Department> { return this.http.put<Department>(`${this.base}/${id}`, body); }
}
