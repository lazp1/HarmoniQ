import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpInterceptorFn,
  HttpHandlerFn,
} from '@angular/common/http';
import { Observable } from 'rxjs';

export const AuthInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  let token = localStorage.getItem('user');
  token = token ? JSON.parse(token).token : '';

  if (!token) {
    return next(req);
  }

  const clonedRequest = req.clone({
    headers: req.headers.set('Authorization', 'Bearer ' + token),
  });

  return next(clonedRequest);
};
