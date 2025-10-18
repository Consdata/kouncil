import {Component, OnDestroy, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {FormControl, NgForm, Validators} from '@angular/forms';
import {SendService} from './send.service';
import {first, map, switchMap} from 'rxjs/operators';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MessageData, MessageDataHeader, MessageDataService} from '@app/message-data';
import {combineLatest, iif, Observable, of} from 'rxjs';
import {
  MessageFormat,
  SchemaFacadeService,
  SchemaRegistryService,
  SchemaStateService
} from '@app/schema-registry';
import {ServersService} from '@app/common-servers';
import {EditorComponent, MonacoEditorService} from '@app/common-components';
import {SnackBarComponent, SnackBarData, SnackBarType} from '@app/common-utils';
import {LoggerFactory} from '@consdata/logger-api';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare let monaco: any;
const log = LoggerFactory.getLogger('SendComponent');

@Component({
  selector: 'app-send',
  template: `
    <mat-dialog-content *ngIf="messageData$ | async as messageData">
      <form #sendForm="ngForm" (ngSubmit)="onSubmit(messageData)">
        <div class="drawer-header">
          <div class="drawer-title">Send event to {{ messageData.topicName }}</div>
          <div class="spacer"></div>
          <mat-icon mat-dialog-close class="material-symbols-outlined close">close</mat-icon>
        </div>

        <div class="drawer-section-subtitle" ngNonBindable>
          Available placeholders: {{uuid}} {{count}}, {{timestamp}}
          <br>
          Each placeholder could be formatted (e.g. {{timestamp:YYYY}}).
          Format should be given after <strong>colon (:)</strong> which precedes placeholder.
          Supported formats: date patterns (e.g. YYYY), decimal integer conversion (e.g. 04d)
        </div>
        <div class="drawer-section-title">Key</div>

        <app-common-editor [schemaName]="'key'" [schemaType]="keySchemaType"
                           [(ngModel)]="messageData.key" name="key"></app-common-editor>

        <div class="drawer-section-title">
          Headers
          <button type="button" class="small-button" mat-button [disableRipple]="true"
                  (click)="addHeader(messageData.headers)">
            +
          </button>
        </div>
        <div class="header" *ngFor="let header of messageData.headers; let i = index">
          <mat-form-field [appearance]="'outline'" style="width: 48%; padding: 8px">
            <input class="header" [(ngModel)]="header.key" placeholder="Header key" matInput
                   type="text" name="header-key-{{ i }}"/>
          </mat-form-field>
          <mat-form-field [appearance]="'outline'" style="width: 48%; padding: 8px">
            <input class="header" [(ngModel)]="header.value" placeholder="Header value" matInput
                   type="text" name="header-value-{{ i }}"/>
          </mat-form-field>
          <button type="button" class="small-button" mat-button [disableRipple]="true"
                  (click)="removeHeader(i, messageData.headers)">
            -
          </button>
        </div>

        <div class="drawer-section-title">Value</div>

        <app-common-editor [schemaName]="'value'"
                           [schemaType]="valueSchemaType"
                           [(ngModel)]="messageData.value" name="value"></app-common-editor>

        <div class="drawer-section-title">Count</div>
        <div class="drawer-section-subtitle">
          How many times you want to send this event?
        </div>

        <mat-form-field [appearance]="'outline'" class="count">
          <input matInput type="number" min="1" [formControl]="countControl" name="count"/>
          <div matSuffix>
            <button type="button" class="small-button" mat-button [disableRipple]="true"
                    (click)="decreaseCount()">
              -
            </button>
            <button type="button" class="small-button" mat-button [disableRipple]="true"
                    (click)="increaseCount()">
              +
            </button>
          </div>
        </mat-form-field>

        <span class="spacer"></span>

        <div class="actions">
          <button type="button" mat-dialog-close mat-button [disableRipple]="true"
                  class="action-button-white">
            Cancel
          </button>
          <button mat-button [disableRipple]="true"
                  class="action-button-blue"
                  type="submit"
                  [disabled]="isSendButtonDisabled">
            Send event
          </button>
        </div>
      </form>
    </mat-dialog-content>
  `,
  styleUrls: ['./send.component.scss']
})
export class SendComponent implements OnDestroy {

  @ViewChild('sendForm', {read: NgForm}) sendForm: NgForm;

  countControl: FormControl = new FormControl<number>(1, [
    Validators.min(1),
    Validators.required,
  ]);
  isSendButtonDisabled: boolean = false;
  topicName: string;

  keySchemaType: MessageFormat;
  valueSchemaType: MessageFormat;

  @ViewChildren(EditorComponent) monacoEditors: QueryList<EditorComponent>;

  messageData$: Observable<MessageData> = combineLatest([
    this.messageDataService.messageData$,
    this.schemaStateService.isSchemaConfigured$(this.servers.getSelectedServerId())
  ]).pipe(
    switchMap(([messageData, isSchemaConfigured]) => {
        this.topicName = messageData.topicName;
        return iif(() => isSchemaConfigured,
          this.schemaFacade.getExampleSchemaData$(this.servers.getSelectedServerId(), messageData.topicName).pipe(
            map(exampleData => ({
                ...messageData,
                key: messageData.key ?? JSON.stringify(exampleData.exampleKey),
                value: messageData.originalValue
                  ? messageData.originalValue
                  : (messageData.value
                    ? JSON.stringify(messageData.value, null, 2)
                    : JSON.stringify(exampleData.exampleValue, null, 2))
              })
            )),
          of({
              ...messageData,
              value: messageData.originalValue ? JSON.stringify(messageData.originalValue, null, 2) :
                (messageData.value ? JSON.stringify(messageData.value, null, 2) : messageData.value)
            }
          ));
      }
    )
  );

  constructor(
    private http: HttpClient,
    private sendService: SendService,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private servers: ServersService,
    private schemaFacade: SchemaFacadeService,
    private schemaStateService: SchemaStateService,
    private messageDataService: MessageDataService,
    private schemaRegistry: SchemaRegistryService,
    private monacoEditorService: MonacoEditorService
  ) {
    schemaRegistry.getSchemasConfiguration$()
    .pipe()
    .subscribe(configurations => {
      const schemasConfiguration = configurations.find(config => config.serverId === this.servers.getSelectedServerId());
      if (schemasConfiguration.hasSchemaRegistry) {
        this.fetchSchemas();
      } else {
        this.keySchemaType = MessageFormat.STRING;
        this.valueSchemaType = MessageFormat.STRING;
      }
    });
  }

  ngOnDestroy(): void {
    this.monacoEditorService.clearSchemas();
  }

  private fetchSchemas(): void {
    this.schemaRegistry.getLatestSchemas$(this.servers.getSelectedServerId(), this.topicName)
    .pipe()
    .subscribe(result => {
      this.keySchemaType = result.keyMessageFormat;
      this.valueSchemaType = result.valueMessageFormat;

      if (this.keySchemaType !== MessageFormat.STRING) {
        this.monacoEditorService.addSchema('key', JSON.parse(result.keyPlainTextSchema));
      }
      if (this.valueSchemaType !== MessageFormat.STRING) {
        this.monacoEditorService.addSchema('value', JSON.parse(result.valuePlainTextSchema));
      }

      if (!this.keySchemaType) {
        this.keySchemaType = MessageFormat.STRING;
      }
      if (!this.valueSchemaType) {
        this.valueSchemaType = MessageFormat.STRING;
      }

      this.monacoEditorService.registerSchemas();
    });
  }

  onSubmit(messageData: MessageData): void {
    const modelMarkers = monaco.editor.getModelMarkers({});
    if (modelMarkers.length === 0) {
      this.isSendButtonDisabled = true;
      this.messageDataService.setMessageData(messageData);
      this.sendService.send$(this.servers.getSelectedServerId(), this.countControl.value, messageData)
      .pipe(first())
      .subscribe(() => {
        this.dialog.closeAll();
        this.resetForm();
        this.isSendButtonDisabled = false;
        this.snackbar.openFromComponent(SnackBarComponent, {
          data: new SnackBarData(`Successfully sent to ${messageData.topicName}`, SnackBarType.SUCCESS),
          panelClass: ['snackbar', 'snackbar-container-success'],
          duration: 3000
        });
      }, error => {
        log.error(error);
        this.snackbar.openFromComponent(SnackBarComponent, {
          data: new SnackBarData(`Error occurred while sending events to ${messageData.topicName}`, SnackBarType.ERROR),
          panelClass: ['snackbar', 'snackbar-container-error'],
          duration: 3000
        });
        this.isSendButtonDisabled = false;
      });
    } else {
      this.snackbar.openFromComponent(SnackBarComponent, {
        data: new SnackBarData(`Schema validation error`, SnackBarType.ERROR),
        panelClass: ['snackbar', 'snackbar-container-error'],
        duration: 3000
      });
    }
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
    this.sendForm.reset({value: '', key: ''});
    this.countControl.reset(1);
  }

  addHeader(headers: MessageDataHeader[] | undefined): void {
    if (headers) {
      headers.push({key: '', value: ''} as MessageDataHeader);
    }
  }

  removeHeader(i: number, headers: MessageDataHeader[] | undefined): void {
    if (headers) {
      headers.splice(i, 1);
    }
  }
}
