import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Item {
  id?: number;
  name: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = 'http://127.0.0.1:5002';

  constructor(private http: HttpClient) { }

  // GET - Read all items
  getAll(): Observable<Item[]> {
    return this.http.get<Item[]>(`${this.apiUrl}/items`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // GET - Read single item
  getById(id: number): Observable<Item> {
    return this.http.get<Item>(`${this.apiUrl}/items/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // POST - Create new item
  create(item: Item): Observable<Item> {
    return this.http.post<Item>(`${this.apiUrl}/items`, item)
      .pipe(
        catchError(this.handleError)
      );
  }

  // PUT - Update existing item
  update(id: number, item: Item): Observable<Item> {
    return this.http.put<Item>(`${this.apiUrl}/items/${id}`, item)
      .pipe(
        catchError(this.handleError)
      );
  }

  // DELETE - Delete item
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/items/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    
    console.error(errorMessage);
    return throwError(errorMessage);
  }
}