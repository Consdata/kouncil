import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Observable} from 'rxjs';
import {LagGraphModel} from './lag-graph.model';
import {LagGraphComponent} from './lag-graph.component';

@Injectable({
  providedIn: 'root'
})
export class LagGraphOpenerService {

  constructor(private dialog: MatDialog) {
  }

  public openLagGraphDialog$(model: LagGraphModel): Observable<unknown> {
    return this.dialog.open<LagGraphComponent, LagGraphModel>(LagGraphComponent, {
      width: '600px',
      panelClass: ['confirm', 'dialog-with-padding'],
      data: model
    }).afterClosed();
  }
}
