import { Component, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormControl, NgForm, Validators } from '@angular/forms';
import { SendService } from './send.service';
import { first, map, switchMap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ServersService } from '../servers.service';
import {MessageData, MessageDataHeader, MessageDataService} from '@app/message-data';
import {combineLatest, iif, Observable, of} from 'rxjs';
import {SchemaFacadeService, SchemaStateService} from '@app/schema-registry';

@Component({
  selector: 'app-send',
  templateUrl: 'send.component.html',
  styleUrls: ['./send.component.scss']
})
export class SendComponent {

  messageData$: Observable<MessageData> = combineLatest([
    this.messageDataService.messageData$,
    this.schemaStateService.isSchemaConfigured$(this.servers.getSelectedServerId())
  ]).pipe(
    switchMap(([messageData, isSchemaConfigured]) =>
      iif(() => isSchemaConfigured,
        this.schemaFacade.getExampleSchemaData$(this.servers.getSelectedServerId(), messageData.topicName).pipe(
          map(exampleData => ({
              ...messageData,
              key: messageData.key ?? JSON.stringify(exampleData.exampleKey),
              value: messageData.value ? JSON.stringify(messageData.value, null, 2) :
                JSON.stringify(exampleData.exampleValue, null, 2)
          })
        )),
        of({
          ...messageData,
          value: messageData.value ? JSON.stringify(messageData.value, null, 2) : messageData.value
        }
      ))
    )
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
    private schemaStateService: SchemaStateService,
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
