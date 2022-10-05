import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {ConfirmComponent} from './confirm.component';
import {Observable} from 'rxjs';
import {ConfirmModel} from './confirm.model';

@Injectable({
  providedIn: 'root'
})
export class ConfirmService {

  constructor(private dialog: MatDialog) {
  }

  public openConfirmDialog$(model: ConfirmModel): Observable<unknown> {
    return this.dialog.open<ConfirmComponent, ConfirmModel>(ConfirmComponent, {
      width: '600px',
      panelClass: ['confirm', 'dialog-with-padding'],
      data: model
    }).afterClosed();
  }
}
