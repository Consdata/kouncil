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
import {SnackBarComponent} from './snack-bar.component';
import {SnackBarData} from './snack-bar-data';

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
        this.progressBarService.setProgress(false);
        if (error.status === 401 || error.status === 403) {
          this.router.navigate(['/login']);
          return null;
        } else {
          console.log(JSON.stringify(error));
          const consoleErrorMessage = `Error Code: ${error.status}<br>Message: ${error.message}\nError message: ${error.error}`;
          this.snackBar.openFromComponent(SnackBarComponent, {
            data: new SnackBarData(error.error, 'snackbar-error', 'Close'),
            panelClass: ['snackbar'],
            duration: 5000
          });
          return throwError(new Error(consoleErrorMessage));
        }
      })
    );
  }

}
