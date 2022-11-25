import {Injectable} from '@angular/core';
import {ComponentType} from '@angular/cdk/overlay';
import {MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef} from '@angular/material/legacy-dialog';

@Injectable({
  providedIn: 'root'
})
export class DrawerService {

  constructor(private dialog: MatDialog) {
  }

  openDrawerWithPadding<T, R = unknown>(component: ComponentType<T>,width?: string): MatDialogRef<T, R> {
    return this.open(component, null, ['app-drawer', 'dialog-with-padding'], width);
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
