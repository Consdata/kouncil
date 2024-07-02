import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {first, map} from 'rxjs/operators';
import {Router} from '@angular/router';
import {TrackService} from '../../track/track.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Clipboard} from '@angular/cdk/clipboard';
import {MessageData, MessageDataHeader, MessageDataService} from '@app/message-data';
import {BehaviorSubject, combineLatest, Observable} from 'rxjs';
import {DrawerService, ObjectUtils, SnackBarComponent, SnackBarData} from '@app/common-utils';
import {SendComponent} from '@app/feat-send';
import {AbstractTableComponent, TableColumn} from '@app/common-components';
import {AuthService, KouncilRole} from '@app/common-auth';

@Component({
  selector: 'app-message-view',
  template: `
    <mat-dialog-content *ngIf="vm$ | async as vm">
      <div class="drawer-header">
        <div class="drawer-title">Event preview</div>
        <div class="spacer"></div>
        <mat-icon mat-dialog-close class="material-symbols-outlined close">close</mat-icon>
      </div>
      <div class="headers" *ngIf="vm.messageData.headers.length > 0 && vm.isAnimationDone">
        <div class="label">Headers</div>
        <app-common-table [tableData]="vm.messageData.headers" [columns]="columns"
                          matSort [sort]="sort"
                          cdkDropList cdkDropListOrientation="horizontal"
                          (cdkDropListDropped)="drop($event)"
                          (rowClickedAction)="navigateToTrack($event, vm.messageData)"
                          [headerClass]="'white-table-header'">

          <ng-container *ngFor="let column of columns; let index = index">
            <app-common-table-column [column]="column" [index]="index"></app-common-table-column>
          </ng-container>

        </app-common-table>

        <div *ngIf="!vm.isAnimationDone" class="kafka-progress"></div>
      </div>
      <div class="payload">
        <div class="key-section">
          <div class="label">Key (deserialized from {{ vm.messageData.keyFormat }} format)</div>
          <ngx-json-viewer class="message-payload"
                           [json]="removeNull(vm.messageData.key)"></ngx-json-viewer>
        </div>
        <div class="value-section">
          <div class="label">Value (deserialized from {{ vm.messageData.valueFormat }} format)</div>
          <ngx-json-viewer class="message-payload"
                           [json]="removeNull(vm.messageData.value)"></ngx-json-viewer>
        </div>
      </div>

      <div class="actions">
        <button type="button" mat-dialog-close mat-button [disableRipple]="true"
                class="action-button-white">
          Cancel
        </button>
        <span class="spacer"></span>
        <button mat-button [disableRipple]="true" class="action-button-white"
                (click)="copyToClipboard(vm.messageData.value)">Copy to
          clipboard
        </button>
        <button mat-button [disableRipple]="true"
                *ngIf="authService.canAccess([KouncilRole.TOPIC_RESEND_MESSAGE])"
                class="action-button-black" (click)="resend(vm.messageData)">
          Resend event
        </button>
      </div>

    </mat-dialog-content>
  `,
  styleUrls: ['./message-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessageViewComponent extends AbstractTableComponent implements OnInit {

  private isAnimationDone$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  KouncilRole: typeof KouncilRole = KouncilRole;

  columns: TableColumn[] = [
    {
      name: 'header key',
      prop: 'key',
      sticky: false,
      resizeable: true,
      sortable: true,
      draggable: true
    },
    {
      name: 'header value',
      prop: 'value',
      sticky: false,
      resizeable: true,
      sortable: true,
      draggable: true
    },
  ];

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
    private messageDataService: MessageDataService,
    protected authService: AuthService
  ) {
    super();
  }

  copyToClipboard(object: string): void {
    this.clipboard.copy(JSON.stringify(object, null, 2));
    this.snackBar.openFromComponent(SnackBarComponent, {
      data: new SnackBarData(`Copied successfully`, 'snackbar-info', ''),
      panelClass: ['snackbar'],
      duration: 1000
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

  navigateToTrack(event: MessageDataHeader, messageData: MessageData): void {
    this.dialogRef.close();
    this.trackService.storeTrackFilter(event.key, event.value, messageData.timestamp, messageData.topicName);
    this.router.navigate(['/track']);
  }

  removeNull(value: string): string {
    return ObjectUtils.removeNull(value);
  }
}
