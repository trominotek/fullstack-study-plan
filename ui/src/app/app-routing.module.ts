import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ItemListComponent } from './components/item-list.component';
import { ItemFormComponent } from './components/item-form.component';
import { ItemDetailComponent } from './components/item-detail.component';

const routes: Routes = [
  { path: '', redirectTo: '/items', pathMatch: 'full' },
  { path: 'items', component: ItemListComponent },
  { path: 'items/new', component: ItemFormComponent },
  { path: 'items/:id', component: ItemDetailComponent },
  { path: 'items/edit/:id', component: ItemFormComponent },
  { path: '**', redirectTo: '/items' } // Wildcard route for 404 pages
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }