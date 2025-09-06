import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DataService, Item } from '../services/data.service';

@Component({
  selector: 'app-item-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container">
      <div class="header">
        <h2>{{isEditMode ? 'Edit Item' : 'Create New Item'}}</h2>
        <button class="btn btn-secondary" (click)="goBack()">
          ← Back to List
        </button>
      </div>
      
      <div *ngIf="isLoading" class="loading">
        Loading item data...
      </div>
      
      <div *ngIf="error" class="error">
        {{error}}
        <button class="btn btn-secondary" (click)="goBack()">Go Back</button>
      </div>
      
      <form [formGroup]="itemForm" (ngSubmit)="onSubmit()" *ngIf="!isLoading && !error" class="item-form">
        <div class="form-group">
          <label for="name">Name *</label>
          <input 
            type="text" 
            id="name"
            formControlName="name" 
            class="form-control"
            [class.error]="itemForm.get('name')?.invalid && itemForm.get('name')?.touched"
            placeholder="Enter item name">
          <div class="field-error" *ngIf="itemForm.get('name')?.invalid && itemForm.get('name')?.touched">
            Name is required and must be at least 3 characters long
          </div>
        </div>
        
        <div class="form-group">
          <label for="description">Description</label>
          <textarea 
            id="description"
            formControlName="description" 
            class="form-control"
            rows="4"
            placeholder="Enter item description (optional)">
          </textarea>
        </div>
        
        <div class="form-actions">
          <button 
            type="submit" 
            class="btn btn-primary"
            [disabled]="!itemForm.valid || isSubmitting">
            {{getSubmitButtonText()}}
          </button>
          <button 
            type="button" 
            class="btn btn-secondary"
            (click)="resetForm()"
            [disabled]="isSubmitting">
            Reset
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .container {
      max-width: 800px;
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
      margin-bottom: 20px;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 5px;
      font-weight: 600;
      color: #333;
    }
    
    .form-control {
      width: 100%;
      padding: 10px;
      border: 2px solid #ddd;
      border-radius: 4px;
      font-size: 16px;
      transition: border-color 0.2s;
      box-sizing: border-box;
    }
    
    .form-control:focus {
      outline: none;
      border-color: #007bff;
    }
    
    .form-control.error {
      border-color: #dc3545;
    }
    
    .field-error {
      color: #dc3545;
      font-size: 14px;
      margin-top: 5px;
    }
    
    .form-actions {
      display: flex;
      gap: 15px;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }
    
    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      font-weight: 500;
      transition: background-color 0.2s;
      min-width: 120px;
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
    
    textarea.form-control {
      resize: vertical;
      min-height: 100px;
    }
  `]
})
export class ItemFormComponent implements OnInit {
  itemForm: FormGroup;
  isEditMode = false;
  currentId: number | null = null;
  isLoading = false;
  isSubmitting = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.itemForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['']
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.currentId = +id;
      this.loadItem(this.currentId);
    }
  }

  loadItem(id: number) {
    this.isLoading = true;
    this.error = null;
    
    this.dataService.getById(id).subscribe({
      next: (item) => {
        this.itemForm.patchValue({
          name: item.name,
          description: item.description || ''
        });
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Failed to load item data';
        this.isLoading = false;
        console.error('Error loading item:', error);
      }
    });
  }

  onSubmit() {
    if (this.itemForm.valid) {
      this.isSubmitting = true;
      const formData: Item = {
        name: this.itemForm.value.name.trim(),
        description: this.itemForm.value.description?.trim() || ''
      };

      const operation = this.isEditMode && this.currentId
        ? this.dataService.update(this.currentId, formData)
        : this.dataService.create(formData);

      operation.subscribe({
        next: (response) => {
          console.log('Item saved successfully:', response);
          this.router.navigate(['/items']);
        },
        error: (error) => {
          console.error('Error saving item:', error);
          alert('Failed to save item. Please try again.');
          this.isSubmitting = false;
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.itemForm.controls).forEach(key => {
        this.itemForm.get(key)?.markAsTouched();
      });
    }
  }

  resetForm() {
    if (this.isEditMode && this.currentId) {
      // In edit mode, reload the original data
      this.loadItem(this.currentId);
    } else {
      // In create mode, clear the form
      this.itemForm.reset();
    }
  }

  goBack() {
    this.router.navigate(['/items']);
  }

  getSubmitButtonText(): string {
    if (this.isSubmitting) {
      return this.isEditMode ? 'Updating...' : 'Creating...';
    }
    return this.isEditMode ? 'Update Item' : 'Create Item';
  }
}