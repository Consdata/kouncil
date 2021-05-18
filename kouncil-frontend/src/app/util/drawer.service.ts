import {Injectable} from '@angular/core';
import {ComponentType} from '@angular/cdk/overlay';
import {MatDialogRef} from '@angular/material/dialog/dialog-ref';
import {MatDialog} from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class DrawerService {

  constructor(private dialog: MatDialog) {
  }

  openDrawerWithPadding<T, R = any>(component: ComponentType<T>, data: any): MatDialogRef<T, R> {
    return this.open(component, data, ['app-drawer', 'dialog-with-padding']);
  }

  openDrawerWithoutPadding<T, R = any>(component: ComponentType<T>, data: any): MatDialogRef<T, R> {
    return this.open(component, data, ['app-drawer']);
  }

  open<T, R = any>(component: ComponentType<T>, data: any, panelClass: string[]): MatDialogRef<T, R> {
    return this.dialog.open(component, {
      data: data,
      height: '100%',
      width: '787px',
      position: {
        right: '0px'
      },
      panelClass: panelClass
    });
  }
}
