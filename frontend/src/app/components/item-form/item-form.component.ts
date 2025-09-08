import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService, Item } from '../../services/data.service';

@Component({
  selector: 'app-item-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="header">
        <h2>{{isEditMode ? 'Edit Item' : 'Create New Item'}}</h2>
        <button class="btn btn-secondary" (click)="goBack()">
          ← Back to List
        </button>
      </div>
      
      <div *ngIf="isLoading" class="loading">
        {{isEditMode ? 'Loading item...' : 'Preparing form...'}}
      </div>
      
      <div *ngIf="error" class="error">
        {{error}}
        <button class="btn btn-secondary" (click)="goBack()">Go Back</button>
      </div>
      
      <form *ngIf="!isLoading && !error" (ngSubmit)="onSubmit()" #itemForm="ngForm" class="item-form">
        <div class="form-group">
          <label for="name">Name *</label>
          <input 
            type="text" 
            id="name" 
            name="name" 
            [(ngModel)]="item.name" 
            #name="ngModel"
            required
            class="form-control"
            placeholder="Enter item name"
          >
          <div *ngIf="name.invalid && name.touched" class="field-error">
            Name is required
          </div>
        </div>
        
        <div class="form-group">
          <label for="description">Description</label>
          <textarea 
            id="description" 
            name="description" 
            [(ngModel)]="item.description" 
            class="form-control"
            rows="4"
            placeholder="Enter item description (optional)"
          ></textarea>
        </div>
        
        <div class="form-actions">
          <button 
            type="submit" 
            class="btn btn-primary"
            [disabled]="itemForm.invalid || isSaving"
          >
            {{isSaving ? 'Saving...' : (isEditMode ? 'Update Item' : 'Create Item')}}
          </button>
          <button 
            type="button" 
            class="btn btn-secondary"
            (click)="goBack()"
            [disabled]="isSaving"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #eee;
    }
    
    .header h2 {
      color: #333;
      margin: 0;
    }
    
    .loading, .error {
      text-align: center;
      padding: 40px;
      background: #f9f9f9;
      border-radius: 8px;
      margin: 20px 0;
    }
    
    .error {
      background: #ffe6e6;
      color: #d63384;
    }
    
    .item-form {
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .form-group {
      margin-bottom: 25px;
    }
    
    .form-group label {
      display: block;
      font-weight: 600;
      color: #333;
      margin-bottom: 8px;
      font-size: 14px;
    }
    
    .form-control {
      width: 100%;
      padding: 12px;
      border: 2px solid #e9ecef;
      border-radius: 6px;
      font-size: 14px;
      transition: border-color 0.2s, box-shadow 0.2s;
      font-family: inherit;
      box-sizing: border-box;
    }
    
    .form-control:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 3px rgba(0,123,255,0.1);
    }
    
    .form-control.ng-invalid.ng-touched {
      border-color: #dc3545;
    }
    
    textarea.form-control {
      resize: vertical;
      min-height: 100px;
    }
    
    .field-error {
      color: #dc3545;
      font-size: 12px;
      margin-top: 5px;
    }
    
    .form-actions {
      margin-top: 30px;
      display: flex;
      gap: 15px;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }
    
    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: background-color 0.2s;
      text-decoration: none;
      display: inline-block;
      text-align: center;
    }
    
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .btn-primary {
      background-color: #007bff;
      color: white;
    }
    
    .btn-primary:hover:not(:disabled) {
      background-color: #0056b3;
    }
    
    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }
    
    .btn-secondary:hover:not(:disabled) {
      background-color: #545b62;
    }
  `]
})
export class ItemFormComponent implements OnInit {
  item: Item = { name: '', description: '' };
  isEditMode = false;
  isLoading = false;
  isSaving = false;
  error: string | null = null;
  itemId: number | null = null;

  constructor(
    private dataService: DataService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.itemId = +id;
      this.loadItem();
    }
  }

  loadItem() {
    if (!this.itemId) return;
    
    this.isLoading = true;
    this.error = null;
    
    this.dataService.getById(this.itemId).subscribe({
      next: (item) => {
        this.item = item;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Failed to load item for editing';
        this.isLoading = false;
        console.error('Error loading item:', error);
      }
    });
  }

  onSubmit() {
    if (!this.item.name.trim()) {
      return;
    }

    this.isSaving = true;
    
    const operation = this.isEditMode 
      ? this.dataService.update(this.itemId!, this.item)
      : this.dataService.create(this.item);
    
    operation.subscribe({
      next: (savedItem) => {
        console.log('Item saved successfully:', savedItem);
        this.router.navigate(['/items']);
      },
      error: (error) => {
        console.error('Error saving item:', error);
        alert(`Failed to ${this.isEditMode ? 'update' : 'create'} item. Please try again.`);
        this.isSaving = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/items']);
  }
}