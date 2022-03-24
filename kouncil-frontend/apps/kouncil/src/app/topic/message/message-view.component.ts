import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {SendComponent} from '../../send/send.component';
import {DrawerService} from '../../util/drawer.service';
import {MessageHeader} from '../message-header';
import {first} from 'rxjs/operators';
import {Router} from '@angular/router';
import {TrackService} from '../../track/track.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Clipboard} from '@angular/cdk/clipboard';

@Component({
  selector: 'app-message-view',
  template: `
    <mat-dialog-content>
      <div class="drawer-header">
        <div class="drawer-title">Event preview</div>
        <div class="spacer"></div>
        <mat-icon mat-dialog-close class="close">close</mat-icon>
      </div>
      <div class="headers-table">
        <ngx-datatable *ngIf="data.headers.length > 0 && isAnimationDone" class="headers-table-detail material"
                       [rows]="data.headers"
                       [rowHeight]="38"
                       [headerHeight]="38"
                       [scrollbarH]="false"
                       [scrollbarV]="false"
                       [columnMode]="'force'"
                       (activate)="navigateToTrack($event)">
          <ngx-datatable-column prop="key" name="header key"></ngx-datatable-column>
          <ngx-datatable-column prop="value" name="header value"></ngx-datatable-column>
        </ngx-datatable>
        <div *ngIf="!isAnimationDone" class="kafka-progress"></div>
      </div>

      <ngx-json-viewer [json]="data.source" class="json-details"></ngx-json-viewer>

      <div class="actions">
        <button type="button" mat-dialog-close mat-button disableRipple class="cancel">Cancel</button>
        <span class="spacer"></span>
        <button mat-button disableRipple class="cancel" (click)="copyToClipboard(data.source)">Copy to clipboard
        </button>
        <button mat-button disableRipple class="action" (click)="resend()">Resend event</button>
      </div>

    </mat-dialog-content>
  `,
  styleUrls: ['./message-view.component.scss']
})
export class MessageViewComponent implements OnInit {
  public isAnimationDone: boolean = false;

  constructor(
    private drawerService: DrawerService,
    private router: Router,
    private trackService: TrackService,
    public snackBar: MatSnackBar,
    private clipboard: Clipboard,
    private dialogRef: MatDialogRef<MessageViewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      topicName: string,
      key: string,
      source: string,
      headers: MessageHeader[],
      timestamp: number
    }) {
  }

  copyToClipboard(object: string): void {
    this.clipboard.copy(JSON.stringify(object, null, 2));
    this.snackBar.open('Copied successfully', '', {
      duration: 1000,
      panelClass: ['snackbar-info', 'snackbar']
    });
  }

  resend(): void {
    this.dialogRef.close();
    this.drawerService.openDrawerWithPadding(SendComponent, {
      topicName: this.data.topicName,
      key: this.data.key,
      source: this.data.source,
      headers: this.data.headers
    });
  }

  ngOnInit(): void {
    // ngx datatable gets its width completely wrong
    // if displayed before container reaches its final size
    this.dialogRef.afterOpened().pipe(first()).subscribe(() => {
      this.isAnimationDone = true;
    });
  }

  navigateToTrack(event): void {
    const element = event.event.target as HTMLElement;
    if (event.type === 'click' && element.nodeName !== 'MAT-ICON' && element.nodeName !== 'BUTTON') {
      this.dialogRef.close();
      this.trackService.storeTrackFilter(event.row.key, event.row.value, this.data.timestamp, this.data.topicName);
      this.router.navigate(['/track']);
    }
  }

}
