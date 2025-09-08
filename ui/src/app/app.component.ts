import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app">
      <header class="app-header">
        <div class="container">
          <h1 class="app-title">
            <a routerLink="/items">CRUD Application</a>
          </h1>
          <nav class="app-nav">
            <a routerLink="/items" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
              Items List
            </a>
            <a routerLink="/items/new" routerLinkActive="active">
              Add Item
            </a>
          </nav>
        </div>
      </header>
      
      <main class="app-main">
        <router-outlet></router-outlet>
      </main>
      
      <footer class="app-footer">
        <div class="container">
          <p>&copy; 2024 Angular CRUD App - Connected to Backend at http://127.0.0.1:5002</p>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .app {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    .app-header {
      background: linear-gradient(135deg, #007bff, #0056b3);
      color: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 70px;
    }
    
    .app-title {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    
    .app-title a {
      color: white;
      text-decoration: none;
    }
    
    .app-title a:hover {
      text-decoration: underline;
    }
    
    .app-nav {
      display: flex;
      gap: 20px;
    }
    
    .app-nav a {
      color: rgba(255,255,255,0.8);
      text-decoration: none;
      padding: 8px 16px;
      border-radius: 4px;
      transition: all 0.2s;
      font-weight: 500;
    }
    
    .app-nav a:hover {
      color: white;
      background: rgba(255,255,255,0.1);
    }
    
    .app-nav a.active {
      color: white;
      background: rgba(255,255,255,0.2);
    }
    
    .app-main {
      flex: 1;
      background: #f8f9fa;
      min-height: calc(100vh - 140px);
    }
    
    .app-footer {
      background: #333;
      color: #ccc;
      text-align: center;
      height: 70px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .app-footer p {
      margin: 0;
      font-size: 14px;
    }
  `]
})
export class AppComponent {
  title = 'ui';
}