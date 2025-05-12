import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllDepartments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}api/department`);
  }

  getDepartment(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}api/department/${id}`);
  }
}
