import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {ConfirmComponent} from './confirm.component';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfirmService {

  constructor(private dialog: MatDialog) {
  }

  openConfirmDialog(objectType: string, objectName: string): Observable<unknown> {
    return this.dialog.open(ConfirmComponent, {
      width: '600px',
      panelClass: ['confirm', 'dialog-with-padding'],
      data: {
        objectName: objectName,
        objectType: objectType
      }
    }).afterClosed();
  }
}
