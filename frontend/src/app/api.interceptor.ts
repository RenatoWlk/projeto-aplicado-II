import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url.startsWith('/api')) {
      const apiReq = req.clone({
        url: req.url.replace('/api', environment.apiUrl),
        setHeaders: {
          'ngsw-bypass': 'true'
        }
      });
      return next.handle(apiReq);
    }
    
    return next.handle(req);
  }
}