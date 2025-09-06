import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DataService, Item } from '../services/data.service';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <div class="header">
        <h2>Items Management</h2>
        <button class="btn btn-primary" (click)="navigateToCreate()">
          Add New Item
        </button>
      </div>
      
      <div *ngIf="isLoading" class="loading">
        Loading items...
      </div>
      
      <div *ngIf="error" class="error">
        {{error}}
        <button class="btn btn-secondary" (click)="loadItems()">Retry</button>
      </div>
      
      <div *ngIf="!isLoading && !error && items.length === 0" class="empty-state">
        <p>No items found. Create your first item!</p>
      </div>
      
      <div class="items-grid" *ngIf="!isLoading && !error && items.length > 0">
        <div *ngFor="let item of items" class="item-card">
          <div class="item-header">
            <h3>{{item.name}}</h3>
            <span class="item-id">#{{item.id}}</span>
          </div>
          <p class="item-description">{{item.description || 'No description'}}</p>
          <div class="item-actions">
            <button class="btn btn-info" (click)="viewItem(item.id!)">View</button>
            <button class="btn btn-warning" (click)="editItem(item.id!)">Edit</button>
            <button class="btn btn-danger" (click)="confirmDelete(item)" 
                    [disabled]="deletingId === item.id">
              {{deletingId === item.id ? 'Deleting...' : 'Delete'}}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
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
    
    .loading, .error, .empty-state {
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
    
    .items-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }
    
    .item-card {
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .item-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }
    
    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    
    .item-header h3 {
      margin: 0;
      color: #333;
    }
    
    .item-id {
      background: #e9ecef;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      color: #6c757d;
    }
    
    .item-description {
      color: #666;
      margin: 10px 0;
      line-height: 1.4;
    }
    
    .item-actions {
      display: flex;
      gap: 8px;
      margin-top: 15px;
    }
    
    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.2s;
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
    
    .btn-info {
      background-color: #17a2b8;
      color: white;
    }
    
    .btn-info:hover:not(:disabled) {
      background-color: #138496;
    }
    
    .btn-warning {
      background-color: #ffc107;
      color: #212529;
    }
    
    .btn-warning:hover:not(:disabled) {
      background-color: #e0a800;
    }
    
    .btn-danger {
      background-color: #dc3545;
      color: white;
    }
    
    .btn-danger:hover:not(:disabled) {
      background-color: #c82333;
    }
    
    .btn-secondary {
      background-color: #6c757d;
      color: white;
      margin-left: 10px;
    }
    
    .btn-secondary:hover:not(:disabled) {
      background-color: #545b62;
    }
  `]
})
export class ItemListComponent implements OnInit {
  items: Item[] = [];
  isLoading = false;
  error: string | null = null;
  deletingId: number | null = null;

  constructor(
    private dataService: DataService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadItems();
  }

  loadItems() {
    this.isLoading = true;
    this.error = null;
    
    this.dataService.getAll().subscribe({
      next: (data) => {
        this.items = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = error;
        this.isLoading = false;
      }
    });
  }

  navigateToCreate() {
    this.router.navigate(['/items/new']);
  }

  viewItem(id: number) {
    this.router.navigate(['/items', id]);
  }

  editItem(id: number) {
    this.router.navigate(['/items/edit', id]);
  }

  confirmDelete(item: Item) {
    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
      this.deleteItem(item.id!);
    }
  }

  deleteItem(id: number) {
    this.deletingId = id;
    
    this.dataService.delete(id).subscribe({
      next: () => {
        this.loadItems(); // Reload the list
        this.deletingId = null;
      },
      error: (error) => {
        console.error('Error deleting item:', error);
        alert('Failed to delete item. Please try again.');
        this.deletingId = null;
      }
    });
  }
}