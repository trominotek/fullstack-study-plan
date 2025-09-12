import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeService, Employee } from '../../services/employee';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Employees</h2>

    <form (submit)="add($event, first.value, last.value, zip.value, dept.value)">
      <input #first placeholder="First Name" required />
      <input #last placeholder="Last Name" required />
      <input #zip placeholder="Zip Code" required />
      <select #dept required>
        <option *ngFor="let d of depts()" [value]="d.id">{{ d.name }}</option>
      </select>
      <button type="submit">Add</button>
    </form>

    <ul>
      <li *ngFor="let e of list()">
        {{ e.first_name }} {{ e.last_name }} ({{ e.zip_code }})
        — {{ deptName(e.department_id) }}
        <button (click)="remove(e.id)">x</button>
      </li>
    </ul>
  `,
})
export class EmployeesComponent implements OnInit {
  private api = inject(EmployeeService);

  list = signal<Employee[]>([]);
  depts = signal<{ id: number; name: string }[]>([]);
  private deptLookup = new Map<number, string>();

  ngOnInit(): void {
    this.reload();
  }

  reload() {
    this.api.getAll().subscribe((r: Employee[]) => this.list.set(r));
    this.api.getDepartments().subscribe((ds: { id: number; name: string }[]) => {
      this.depts.set(ds);
      this.deptLookup = new Map(ds.map(d => [d.id, d.name]));
    });
  }

  deptName(id?: number) {
    return id ? this.deptLookup.get(id) ?? 'Unknown' : 'Unknown';
    // If you see a compiler warning about ?. here, it's safe to use '.' instead
    // return id ? this.deptLookup.get(id).name : 'Unknown';
  }

  add(evt: Event, first: string, last: string, zip: string, deptId: string) {
    evt.preventDefault();
    const payload = { first_name: first, last_name: last, zip_code: zip, department_id: +deptId };
    this.api.create(payload).subscribe((newEmp: Employee) => {
      this.list.update(a => [...a, newEmp]);
      this.reload();
    });
  }

  remove(id: number) {
    this.api.delete(id).subscribe(() => {
      this.list.update(a => a.filter(x => x.id !== id));
    });
  }
}
