import {Injectable} from '@angular/core';
import {ComponentType} from '@angular/cdk/overlay';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class DrawerService {

  constructor(private dialog: MatDialog) {
  }

  openDrawerWithPadding<T, R = unknown>(component: ComponentType<T>,width?: string): MatDialogRef<T, R> {
    return this.open(component, null, ['app-drawer'], width);
  }

  openDrawerWithoutPadding<T, R = unknown>(component: ComponentType<T>, data: unknown, width?: string): MatDialogRef<T, R> {
    return this.open(component, data, ['app-drawer'], width);
  }

  private open<T, R = unknown>(component: ComponentType<T>, data: unknown,
                               panelClass: string[], width: string = '787px'): MatDialogRef<T, R> {
    return this.dialog.open(component, {
      data: data,
      height: '100%',
      width: width,
      position: {
        right: '0px'
      },
      panelClass: panelClass
    });
  }
}
