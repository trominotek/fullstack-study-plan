import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DepartmentService, Department } from '../../services/department';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Departments</h2>

    <form (submit)="add($event, name.value, desc.value)">
      <input #name placeholder="Name" required />
      <input #desc placeholder="Description" required />
      <button type="submit">Add</button>
    </form>

    <ul>
      <li *ngFor="let d of list()">
        <b>{{ d.name }}</b> — {{ d.description }}
        <button (click)="remove(d.id)">x</button>
      </li>
    </ul>
  `,
})
export class DepartmentsComponent implements OnInit {
  private api = inject(DepartmentService);
  list = signal<Department[]>([]);

  ngOnInit(): void {
    this.reload();
  }

  reload() { this.api.getAll().subscribe((r: Department[]) => this.list.set(r)); }

  add(evt: Event, name: string, description: string) {
    evt.preventDefault();
    this.api.create({ name, description }).subscribe((newDept: Department) => {
      this.list.update(a => [...a, newDept]);
    });
  }

  remove(id: number) {
    this.api.delete(id).subscribe(() => {
      this.list.update(a => a.filter(x => x.id !== id));
    });
  }
}
