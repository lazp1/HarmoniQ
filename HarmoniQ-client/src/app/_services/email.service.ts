import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BulkEmailRequest } from '../_models/bulk-email.model';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private baseUrl = `${environment.apiUrl}api/email/`;

  constructor(private http: HttpClient) { }

  sendBulkEmail(request: BulkEmailRequest) {
    return this.http.post<{message: string}>(
      `${this.baseUrl}bulk`,
      request,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}
