import { Routes } from '@angular/router';
import { ItemListComponent } from './components/item-list/item-list.component';
import { ItemFormComponent } from './components/item-form/item-form.component';
import { ItemDetailComponent } from './components/item-detail/item-detail.component';

export const routes: Routes = [
  { path: '', redirectTo: '/items', pathMatch: 'full' },
  { path: 'items', component: ItemListComponent },
  { path: 'items/new', component: ItemFormComponent },
  { path: 'items/:id', component: ItemDetailComponent },
  { path: 'items/edit/:id', component: ItemFormComponent },
  { path: '**', redirectTo: '/items' } // Wildcard route for 404 pages
];
