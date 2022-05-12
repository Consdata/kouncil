import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {SendComponent} from '../../send/send.component';
import {DrawerService} from '../../util/drawer.service';
import {first, tap} from 'rxjs/operators';
import {Router} from '@angular/router';
import {TrackService} from '../../track/track.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Clipboard} from '@angular/cdk/clipboard';
import {Model} from '@swimlane/ngx-datatable';
import {MessageData, MessageDataService} from '@app/message-data';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-message-view',
  template: `
    <mat-dialog-content *ngIf="messageData$ | async as messageData">
      <div class="drawer-header">
        <div class="drawer-title">Event preview</div>
        <div class="spacer"></div>
        <mat-icon mat-dialog-close class="close">close</mat-icon>
      </div>
      <div class="headers" *ngIf="messageData.headers.length > 0 && isAnimationDone">
        <div class="label">Headers</div>
        <ngx-datatable class="headers-table-detail material"
                       [rows]="messageData.headers"
                       [rowHeight]="38"
                       [headerHeight]="38"
                       [scrollbarH]="false"
                       [scrollbarV]="false"
                       [columnMode]="'force'"
                       (activate)="navigateToTrack($event, messageData)">
          <ngx-datatable-column prop="key" name="header key"></ngx-datatable-column>
          <ngx-datatable-column prop="value" name="header value"></ngx-datatable-column>
        </ngx-datatable>
        <div *ngIf="!isAnimationDone" class="kafka-progress"></div>
      </div>
      <div class="payload">
        <div class="key-section">
          <div class="label">Key (deserialized from {{ messageData.keyFormat }} format)</div>
          <div class="message-payload">
            <ngx-json-viewer [json]="messageData.key"></ngx-json-viewer>
          </div>
        </div>
        <div class="value-section">
          <div class="label">Value (deserialized from {{ messageData.valueFormat }} format)</div>
          <div class="message-payload">
            <ngx-json-viewer [json]="messageData.value"></ngx-json-viewer>
          </div>
        </div>
      </div>

      <div class="actions">
        <button type="button" mat-dialog-close mat-button disableRipple class="cancel">Cancel</button>
        <span class="spacer"></span>
        <button mat-button disableRipple class="cancel" (click)="copyToClipboard(messageData.value)">Copy to clipboard
        </button>
        <button mat-button disableRipple class="action" (click)="resend(messageData)">Resend event</button>
      </div>

    </mat-dialog-content>
  `,
  styleUrls: ['./message-view.component.scss']
})
export class MessageViewComponent implements OnInit {
  messageData$: Observable<MessageData> = this.messageDataService.messageData$.pipe(tap(as => console.log(as)));

  public isAnimationDone: boolean = false;

  constructor(
    private drawerService: DrawerService,
    private router: Router,
    private trackService: TrackService,
    public snackBar: MatSnackBar,
    private clipboard: Clipboard,
    private dialogRef: MatDialogRef<MessageViewComponent>,
    private messageDataService: MessageDataService) {
  }

  copyToClipboard(object: string): void {
    this.clipboard.copy(JSON.stringify(object, null, 2));
    this.snackBar.open('Copied successfully', '', {
      duration: 1000,
      panelClass: ['snackbar-info', 'snackbar']
    });
  }

  resend(messageData: MessageData): void {
    this.dialogRef.close();
    this.messageDataService.setMessageData(messageData);
    this.drawerService.openDrawerWithPadding(SendComponent);
  }

  ngOnInit(): void {
    // ngx datatable gets its width completely wrong
    // if displayed before container reaches its final size
    this.dialogRef.afterOpened().pipe(first()).subscribe(() => {
      this.isAnimationDone = true;
    });
  }

  navigateToTrack(event: Model, messageData: MessageData): void {
    const element = event.event.target as HTMLElement;
    if (event.type === 'click' && element.nodeName !== 'MAT-ICON' && element.nodeName !== 'BUTTON') {
      this.dialogRef.close();
      this.trackService.storeTrackFilter(event.row.key, event.row.value, messageData.timestamp, messageData.topicName);
      this.router.navigate(['/track']);
    }
  }

}
