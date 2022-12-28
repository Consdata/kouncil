import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Injectable} from '@angular/core';
import {ProgressBarService} from './progress-bar.service';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class HttpClientInterceptor implements HttpInterceptor {

  constructor(public snackBar: MatSnackBar, private progressBarService: ProgressBarService,
              private router: Router) {
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request)
    .pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 403) {
          this.router.navigate(['/login']);
          return null;
        } else {
          console.log(JSON.stringify(error));
          const consoleErrorMessage = `Error Code: ${error.status}<br>Message: ${error.message}\nError message: ${error.error}`;
          this.snackBar.open(error.error, 'Close', {
            duration: 5000,
            panelClass: ['snackbar-error', 'snackbar']
          });
          this.progressBarService.setProgress(false);
          return throwError(new Error(consoleErrorMessage));
        }
      })
    );
  }

}
