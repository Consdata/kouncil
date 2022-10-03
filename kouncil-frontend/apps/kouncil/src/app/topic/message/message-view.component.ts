import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {first, map} from 'rxjs/operators';
import {Router} from '@angular/router';
import {TrackService} from '../../track/track.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Clipboard} from '@angular/cdk/clipboard';
import {Model} from '@swimlane/ngx-datatable';
import {MessageData, MessageDataService} from '@app/message-data';
import {BehaviorSubject, combineLatest, Observable} from 'rxjs';
import {DrawerService} from '@app/common-utils';
import {SendComponent} from '@app/feat-send';

@Component({
  selector: 'app-message-view',
  template: `
    <mat-dialog-content *ngIf="vm$ | async as vm">
      <div class="drawer-header">
        <div class="drawer-title">Event preview</div>
        <div class="spacer"></div>
        <mat-icon mat-dialog-close class="close">close</mat-icon>
      </div>
      <div class="headers" *ngIf="vm.messageData.headers.length > 0 && vm.isAnimationDone">
        <div class="label">Headers</div>
        <ngx-datatable class="headers-table-detail material"
                       [rows]="vm.messageData.headers"
                       [rowHeight]="38"
                       [headerHeight]="38"
                       [scrollbarH]="false"
                       [scrollbarV]="false"
                       [columnMode]="'force'"
                       (activate)="navigateToTrack($event, vm.messageData)">
          <ngx-datatable-column prop="key" name="header key"></ngx-datatable-column>
          <ngx-datatable-column prop="value" name="header value"></ngx-datatable-column>
        </ngx-datatable>
        <div *ngIf="!vm.isAnimationDone" class="kafka-progress"></div>
      </div>
      <div class="payload">
        <div class="key-section">
          <div class="label">Key (deserialized from {{ vm.messageData.keyFormat }} format)</div>
          <ngx-json-viewer class="message-payload" [json]="vm.messageData.key"></ngx-json-viewer>
        </div>
        <div class="value-section">
          <div class="label">Value (deserialized from {{ vm.messageData.valueFormat }} format)</div>
          <ngx-json-viewer class="message-payload" [json]="vm.messageData.value"></ngx-json-viewer>
        </div>
      </div>

      <div class="actions">
        <button type="button" mat-dialog-close mat-button disableRipple class="action-button-white">Cancel</button>
        <span class="spacer"></span>
        <button mat-button disableRipple class="action-button-white" (click)="copyToClipboard(vm.messageData.value)">Copy to
          clipboard
        </button>
        <button mat-button disableRipple class="action-button-black" (click)="resend(vm.messageData)">Resend event</button>
      </div>

    </mat-dialog-content>
  `,
  styleUrls: ['./message-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessageViewComponent implements OnInit {

  private isAnimationDone$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  vm$: Observable<{
    messageData: MessageData, isAnimationDone: boolean
  }> = combineLatest([
    this.messageDataService.messageData$,
    this.isAnimationDone$
  ]).pipe(
    map(([messageData, isAnimationDone]) => (
        {messageData, isAnimationDone}
      )
    )
  );

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
      this.isAnimationDone$.next(true);
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
