import { Component, Inject, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormControl, NgForm, Validators } from '@angular/forms';
import { SendService } from './send.service';
import { first } from 'rxjs/operators';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ServersService } from '../servers.service';
import { MessageHeader } from '../topic/message-header';
import { Message } from '../topic/message';

@Component({
  selector: 'app-send',
  template: `
    <mat-dialog-content>
      <form #sendForm="ngForm" (ngSubmit)="onSubmit()">
        <div class="drawer-header">
          <div class="drawer-title">Send event to {{ data.topicName }}</div>
          <div class="spacer"></div>
          <mat-icon mat-dialog-close class="close">close</mat-icon>
        </div>

        <div class="drawer-section-subtitle">
          Available placeholders: {{uuid}<!---->}, {{count}<!---->},
          {{timestamp}<!---->}
        </div>
        <div class="drawer-section-title">Key</div>
        <input [(ngModel)]="message.key" matInput type="text" name="key" />

        <div class="drawer-section-title">
          Headers
          <button
            type="button"
            class="small-button"
            mat-button
            disableRipple
            (click)="addHeader()"
          >
            +
          </button>
        </div>
        <div
          class="header"
          *ngFor="let header of message.headers; let i = index"
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
            (click)="removeHeader(i)"
          >
            -
          </button>
        </div>

        <div class="drawer-section-title">Value</div>

        <textarea rows="10" [(ngModel)]="message.value" name="value"></textarea>

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
  styleUrls: ['./send.component.scss'],
})
export class SendComponent {
  @ViewChild('sendForm', { read: NgForm }) sendForm: NgForm;

  message: Message;
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
    @Inject(MAT_DIALOG_DATA)
    public data: {
      topicName: string;
      key: string;
      source: string;
      headers: MessageHeader[];
    }
  ) {
    console.log(this.data);
    this.message = new Message(
      this.data.key,
      JSON.stringify(this.data.source, null, 2),
      null,
      null,
      null,
      this.data.headers,
      this.data.topicName
    );
  }

  onSubmit(): void {
    this.sendService
      .send(
        this.servers.getSelectedServerId(),
        this.data.topicName,
        this.countControl.value,
        this.message
      )
      .pipe(first())
      .subscribe(() => {
        this.dialog.closeAll();
        this.resetForm();
        this.snackbar.open(`Successfully sent to ${this.data.topicName}`, '', {
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

  addHeader(): void {
    this.message.headers.push(new MessageHeader('', ''));
  }

  removeHeader(i: number): void {
    this.message.headers.splice(i, 1);
  }
}
