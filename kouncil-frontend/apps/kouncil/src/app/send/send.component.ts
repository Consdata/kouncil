import { Component, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormControl, NgForm, Validators } from '@angular/forms';
import { SendService } from './send.service';
import {
  first,
  map,
  switchMap
} from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ServersService } from '../servers.service';
import {MessageData, MessageDataHeader, MessageDataService} from '@app/message-data';
import {combineLatest, Observable} from 'rxjs';
import {SchemaFacadeService} from '@app/schema-registry';

@Component({
  selector: 'app-send',
  template: `
    <mat-dialog-content *ngIf="messageData$ | async as messageData">
      <form #sendForm="ngForm" (ngSubmit)="onSubmit(messageData)">
        <div class="drawer-header">
          <div class="drawer-title">Send event to {{ messageData.topicName }}</div>
          <div class="spacer"></div>
          <mat-icon mat-dialog-close class="close">close</mat-icon>
        </div>

        <div class="drawer-section-subtitle">
          Available placeholders: {{uuid}<!---->}, {{count}<!---->},
          {{timestamp}<!---->}
        </div>
        <div class="drawer-section-title">Key</div>
        <input [(ngModel)]="messageData.key" matInput type="text" name="key" />

        <div class="drawer-section-title">
          Headers
          <button
            type="button"
            class="small-button"
            mat-button
            disableRipple
            (click)="addHeader(messageData.headers)"
          >
            +
          </button>
        </div>
        <div
          class="header"
          *ngFor="let header of messageData.headers; let i = index"
        >
          <input
            class="header"
            [(ngModel)]="header.key"
            placeholder="Header key"
            matInput
            type="text"
            name="header-key-{{ i }}"
          />
          <input
            class="header"
            [(ngModel)]="header.value"
            placeholder="Header value"
            matInput
            type="text"
            name="header-value-{{ i }}"
          />
          <button
            type="button"
            class="small-button"
            mat-button
            disableRipple
            (click)="removeHeader(i, messageData.headers)"
          >
            -
          </button>
        </div>

        <div class="drawer-section-title">Value</div>

        <textarea rows="10" [(ngModel)]="messageData.value" name="value"></textarea>

        <div class="drawer-section-title">Count</div>
        <div class="drawer-section-subtitle">
          How many times you want to send this event?
        </div>
        <div class="count">
          <input
            matInput
            type="number"
            min="1"
            [formControl]="countControl"
            name="count"
          />
          <button
            type="button"
            class="small-button"
            mat-button
            disableRipple
            (click)="decreaseCount()"
          >
            -
          </button>
          <button
            type="button"
            class="small-button"
            mat-button
            disableRipple
            (click)="increaseCount()"
          >
            +
          </button>
        </div>

        <span class="spacer"></span>

        <div class="actions">
          <button
            type="button"
            mat-dialog-close
            mat-button
            disableRipple
            class="cancel"
          >
            Cancel
          </button>
          <span class="spacer"></span>
          <button mat-button disableRipple class="action" type="submit">
            Send event
          </button>
        </div>
      </form>
    </mat-dialog-content>
  `,
  styleUrls: ['./send.component.scss']
})
export class SendComponent {

  messageData$: Observable<MessageData> = combineLatest([
    this.messageDataService.messageData$,
    this.messageDataService.messageData$.pipe(
      switchMap(messageData => this.schemaFacade
        .getExampleSchemaData$(this.servers.getSelectedServerId(), messageData.topicName))
    )
  ]).pipe(
    map(([messageData, exampleData]) => ({
      ...messageData,
      key: messageData.key ?? JSON.stringify(exampleData.exampleKey),
      value: messageData.value ? JSON.stringify(messageData.value, null, 2) :
                                 JSON.stringify(exampleData.exampleValue, null, 2)
    }))
  );

  @ViewChild('sendForm', { read: NgForm }) sendForm: NgForm;

  countControl: FormControl = new FormControl(1, [
    Validators.min(1),
    Validators.required,
  ]);

  constructor(
    private http: HttpClient,
    private sendService: SendService,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private servers: ServersService,
    private schemaFacade: SchemaFacadeService,
    private messageDataService: MessageDataService) {
  }

  onSubmit(messageData: MessageData): void {
    this.messageDataService.setMessageData(messageData);
    this.sendService.send$(this.servers.getSelectedServerId(), this.countControl.value, messageData)
      .pipe(first())
      .subscribe(() => {
        this.dialog.closeAll();
        this.resetForm();
        this.snackbar.open(`Successfully sent to ${messageData.topicName}`, '', {
          duration: 3000,
          panelClass: ['snackbar-success', 'snackbar'],
        });
      });
  }

  increaseCount(): void {
    this.countControl.setValue(this.countControl.value + 1);
  }

  decreaseCount(): void {
    if (this.countControl.value > 1) {
      this.countControl.setValue(this.countControl.value - 1);
    }
  }

  resetForm(): void {
    this.sendForm.reset({ value: '', key: '' });
    this.countControl.reset(1);
  }

  addHeader(headers: MessageDataHeader[]): void {
    headers.push({key: '', value: ''} as MessageDataHeader);
  }

  removeHeader(i: number, headers: MessageDataHeader[]): void {
    headers.splice(i, 1);
  }

}
