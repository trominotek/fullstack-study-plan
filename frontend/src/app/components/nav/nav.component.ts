import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgIf],
  template: `
    <nav style="display:flex; gap:1rem; padding:.75rem; border-bottom:1px solid #eee">
      <a routerLink="/employees" routerLinkActive="active">Employees</a>
      <a routerLink="/departments" routerLinkActive="active">Departments</a>
    </nav>
    <style>
      .active { font-weight: 700; text-decoration: underline; }
    </style>
  `,
})
export class NavComponent {}
