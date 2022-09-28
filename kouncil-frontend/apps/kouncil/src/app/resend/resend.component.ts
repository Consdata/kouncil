import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {first, map, switchMap} from 'rxjs/operators';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ServersService} from '../servers.service';
import {MessageData, MessageDataService} from '@app/message-data';
import {combineLatest, iif, Observable, of} from 'rxjs';
import {SchemaFacadeService, SchemaStateService} from '@app/schema-registry';
import {ResendService} from './resend.service';
import {TopicMetadata, Topics} from '../topics/topics';
import {TopicsService} from '../topics/topics.service';
import {ResendDataModel} from './resend.data.model';

@Component({
  selector: 'app-resend',
  template: `
    <mat-dialog-content *ngIf="messageData$ | async as messageData">
      <form [formGroup]="resendForm" (ngSubmit)="onSubmit()">
        <div class="drawer-header">
          <div class="drawer-title">Resend events from {{messageData.topicName}}</div>
          <div class="spacer"></div>
          <mat-icon mat-dialog-close class="close">close</mat-icon>
        </div>

        <div class="resend-options-wrapper">
          <div class="topic-selection">
            <div class="drawer-section-title">Source topic:</div>
            <mat-form-field>
              <mat-select class="select select-topic"
                          formControlName="sourceTopicName"
                          [(value)]="messageData.topicName">
                <mat-option *ngFor="let topic of topics" [value]="topic.name">{{topic.name}}</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
          <div class="partition-selection">
            <div class="drawer-section-title">Source partition:</div>
            <mat-form-field>
              <mat-select class="select" formControlName="sourceTopicPartition">
                <mat-option [value]="0">None</mat-option>
                <mat-option *ngFor="let i of [0, messageData.partition]" value="{{i}}">{{i}}</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </div>

        <div class="drawer-section-title">With offset to resend:</div>
        <div class="offset-count-wrapper">
          <div class="drawer-section-title">From:</div>
          <div class="count offset-input-fields">
            <input matInput type="number" min="1" formControlName="offsetBeginning" name="count"/>
            <button type="button" class="small-button" mat-button disableRipple (click)="decreaseFromCount()">
              -
            </button>
            <button type="button" class="small-button" mat-button disableRipple (click)="increaseFromCount()">
              +
            </button>
          </div>

          <div class="drawer-section-title">To:</div>
          <div class="count offset-input-fields">
            <input matInput type="number" min="1" formControlName="offsetEnd" name="count"/>
            <button type="button" class="small-button" mat-button disableRipple (click)="decreaseToCount()">
              -
            </button>
            <button type="button" class="small-button" mat-button disableRipple (click)="increaseToCount()">
              +
            </button>
          </div>
        </div>

        <div class="resend-options-wrapper">
          <div class="topic-selection">
            <div class="drawer-section-title">To topic:</div>
            <mat-form-field>
              <mat-select class="select select-topic" formControlName="destinationTopicName">
                <mat-option [value]="messageData.topicName">{{messageData.topicName}}</mat-option>
                <mat-option *ngFor="let topic of topics" [value]="topic.caption()">{{topic.caption()}}</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
          <div class="partition-selection">
            <div class="drawer-section-title">On partition:</div>
            <mat-form-field>
              <mat-select class="select" formControlName="destinationTopicPartition">
                <mat-option [value]="0">None</mat-option>
                <mat-option *ngFor="let i of [0, messageData.partition]" value="{{i}}">{{i}}</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </div>

        <span class="spacer"></span>

        <div class="actions">
          <button
            type="button"
            mat-dialog-close
            mat-button
            disableRipple
            class="action-button-white"
          >
            Cancel
          </button>
          <span class="spacer"></span>
          <button mat-button disableRipple class="action-button-black" type="submit">
            Resend events
          </button>
        </div>
      </form>
    </mat-dialog-content>
  `,
  styleUrls: ['./resend.component.scss']
})
export class ResendComponent implements OnInit{

  resendForm: FormGroup;
  topics: TopicMetadata[] = [];

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

  constructor(
    private http: HttpClient,
    private resendService: ResendService,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private servers: ServersService,
    private topicsService: TopicsService,
    private schemaFacade: SchemaFacadeService,
    private schemaStateService: SchemaStateService,
    private messageDataService: MessageDataService) {
  }

  ngOnInit() {
    this.resendForm = new FormGroup({
      'sourceTopicName': new FormControl('', Validators.required),
      'sourceTopicPartition': new FormControl('None'),
      'offsetBeginning': new FormControl(1, [Validators.min(1), Validators.required]),
      'offsetEnd': new FormControl(1, [Validators.min(1), Validators.required]),
      'destinationTopicName': new FormControl('', Validators.required),
      'destinationTopicPartition': new FormControl('None')
    })

    this.topicsService.getTopics$(this.servers.getSelectedServerId())
      .pipe(first())
      .subscribe((data: Topics) => {
        this.topics = data.topics
          .map(t => new TopicMetadata(t.partitions, null, t.name));
      });
  }

  onSubmit(): void {
    if (this.resendForm.invalid) {
      this.snackbar.open('INVALID FORM VALUES', 'Close', {
        duration: 5000,
        panelClass: ['snackbar-error', 'snackbar']
      });
      return;
    }

    const resendData = {
      sourceTopicName: this.resendForm.value['sourceTopicName'],
      sourceTopicPartition: this.resendForm.value['sourceTopicPartition'],
      offsetBeginning: +this.resendForm.value['offsetBeginning'],
      offsetEnd: +this.resendForm.value['offsetEnd'],
      destinationTopicName: this.resendForm.value['destinationTopicName'],
      destinationTopicPartition: this.resendForm.value['destinationTopicPartition']
    } as ResendDataModel;
    console.log(this.servers.getSelectedServerId());
    this.resendService.resend$(this.servers.getSelectedServerId(), resendData)
      .pipe(first())
      .subscribe(() => {
        this.dialog.closeAll();
        this.resendForm.reset();
        this.snackbar.open(
          `Successfully sent events from ${resendData.sourceTopicName} to ${resendData.destinationTopicName}`,
          '', {
          duration: 5000,
          panelClass: ['snackbar-success', 'snackbar'],
        });
      });
  }

  increaseFromCount(): void {
    const offsetBeginning = this.resendForm.get('offsetBeginning');
    offsetBeginning.setValue(offsetBeginning.value + 1);
  }

  decreaseFromCount(): void {
    const offsetBeginning = this.resendForm.get('offsetBeginning');
    if (offsetBeginning.value > 1) {
      offsetBeginning.setValue(offsetBeginning.value - 1);
    }
  }

  increaseToCount(): void {
    const offsetEnd = this.resendForm.get('offsetEnd');
    offsetEnd.setValue(offsetEnd.value + 1);
  }

  decreaseToCount(): void {
    const offsetEnd = this.resendForm.get('offsetEnd');
    if (offsetEnd.value > 1) {
      offsetEnd.setValue(offsetEnd.value - 1);
    }
  }

}
