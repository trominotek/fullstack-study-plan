import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DataService, Item } from '../services/data.service';

@Component({
  selector: 'app-item-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <div class="header">
        <h2>Item Details</h2>
        <button class="btn btn-secondary" (click)="goBack()">
          ← Back to List
        </button>
      </div>
      
      <div *ngIf="isLoading" class="loading">
        Loading item details...
      </div>
      
      <div *ngIf="error" class="error">
        {{error}}
        <button class="btn btn-secondary" (click)="goBack()">Go Back</button>
      </div>
      
      <div *ngIf="!isLoading && !error && item" class="item-detail">
        <div class="item-header">
          <h3>{{item.name}}</h3>
          <span class="item-id">#{{item.id}}</span>
        </div>
        
        <div class="item-content">
          <div class="detail-section">
            <label>Description:</label>
            <p>{{item.description || 'No description provided'}}</p>
          </div>
        </div>
        
        <div class="item-actions">
          <button class="btn btn-warning" (click)="editItem()">
            Edit Item
          </button>
          <button class="btn btn-danger" (click)="confirmDelete()" 
                  [disabled]="isDeleting">
            {{isDeleting ? 'Deleting...' : 'Delete Item'}}
          </button>
        </div>
      </div>
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
    
    .item-detail {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    
    .item-header {
      background: linear-gradient(135deg, #007bff, #0056b3);
      color: white;
      padding: 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .item-header h3 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    
    .item-id {
      background: rgba(255,255,255,0.2);
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 500;
    }
    
    .item-content {
      padding: 30px;
    }
    
    .detail-section {
      margin-bottom: 20px;
    }
    
    .detail-section label {
      display: block;
      font-weight: 600;
      color: #333;
      margin-bottom: 8px;
      font-size: 16px;
    }
    
    .detail-section p {
      color: #666;
      line-height: 1.6;
      margin: 0;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 6px;
      border-left: 4px solid #007bff;
    }
    
    .item-actions {
      padding: 20px 30px;
      background: #f8f9fa;
      border-top: 1px solid #eee;
      display: flex;
      gap: 15px;
    }
    
    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: background-color 0.2s;
    }
    
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }
    
    .btn-secondary:hover:not(:disabled) {
      background-color: #545b62;
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
  `]
})
export class ItemDetailComponent implements OnInit {
  item: Item | null = null;
  isLoading = false;
  isDeleting = false;
  error: string | null = null;
  itemId: number;

  constructor(
    private dataService: DataService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.itemId = +this.route.snapshot.params['id'];
  }

  ngOnInit() {
    this.loadItem();
  }

  loadItem() {
    this.isLoading = true;
    this.error = null;
    
    this.dataService.getById(this.itemId).subscribe({
      next: (item) => {
        this.item = item;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Failed to load item details';
        this.isLoading = false;
        console.error('Error loading item:', error);
      }
    });
  }

  editItem() {
    this.router.navigate(['/items/edit', this.itemId]);
  }

  confirmDelete() {
    if (this.item && confirm(`Are you sure you want to delete "${this.item.name}"?`)) {
      this.deleteItem();
    }
  }

  deleteItem() {
    this.isDeleting = true;
    
    this.dataService.delete(this.itemId).subscribe({
      next: () => {
        console.log('Item deleted successfully');
        this.router.navigate(['/items']);
      },
      error: (error) => {
        console.error('Error deleting item:', error);
        alert('Failed to delete item. Please try again.');
        this.isDeleting = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/items']);
  }
}