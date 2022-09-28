import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
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
  templateUrl: 'resend.component.html',
  styleUrls: ['./resend.component.scss']
})
export class ResendComponent implements OnInit{

  resendForm: UntypedFormGroup;
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
    this.resendForm = new UntypedFormGroup({
      'sourceTopicName': new UntypedFormControl('', Validators.required),
      'sourceTopicPartition': new UntypedFormControl('None'),
      'offsetBeginning': new UntypedFormControl(1, [Validators.min(1), Validators.required]),
      'offsetEnd': new UntypedFormControl(1, [Validators.min(1), Validators.required]),
      'destinationTopicName': new UntypedFormControl('', Validators.required),
      'destinationTopicPartition': new UntypedFormControl('None')
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
