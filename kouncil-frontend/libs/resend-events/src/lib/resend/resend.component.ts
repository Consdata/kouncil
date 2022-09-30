import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {first, map, takeUntil, tap} from 'rxjs/operators';
import {MatDialog } from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ServersService} from 'apps/kouncil/src/app/servers.service';
import {MessageData, MessageDataService} from '@app/message-data';
import {combineLatest, Observable, ReplaySubject, Subject} from 'rxjs';
import {ResendService} from './resend.service';
import {TopicMetadata, Topics} from 'apps/kouncil/src/app/topics/topics';
import {TopicsService} from 'apps/kouncil/src/app/topics/topics.service';
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
                          (valueChange)="setPartitionsOnSrcTopicChanged($event)">
                <mat-option>
                  <ngx-mat-select-search placeholderLabel="Search topic.."
                                         [formControl]="sourceTopicFilterCtrl">
                  </ngx-mat-select-search>
                </mat-option>
                <mat-option *ngFor="let topic of sourceFilteredTopics$ | async"
                            [value]="topic.caption()">
                  {{topic.caption()}}
                </mat-option>
              </mat-select>
            </mat-form-field>
          </div>
          <div class="partition-selection">
            <div class="drawer-section-title">Source partition:</div>
            <mat-form-field>
              <mat-select class="select"
                          formControlName="sourceTopicPartition">
                <mat-option [value]="-1">None</mat-option>
                <mat-option *ngFor="let partition of srcPartitions"
                            value="{{partition}}">
                  {{partition}}
                </mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </div>

        <div class="drawer-section-title">With offset to resend:</div>
        <div class="offset-count-wrapper">
          <div class="drawer-section-title">From:</div>
          <div class="count offset-input-fields">
            <input matInput type="number" min="1" formControlName="offsetBeginning" name="count"/>
            <button type="button" class="small-button" mat-button disableRipple (click)="decreaseFromOffsetCount()">
              -
            </button>
            <button type="button" class="small-button" mat-button disableRipple (click)="increaseFromOffsetCount()">
              +
            </button>
          </div>

          <div class="drawer-section-title">To:</div>
          <div class="count offset-input-fields">
            <input matInput type="number" min="1" formControlName="offsetEnd" name="count"/>
            <button type="button" class="small-button" mat-button disableRipple (click)="decreaseToOffsetCount()">
              -
            </button>
            <button type="button" class="small-button" mat-button disableRipple (click)="increaseToOffsetCount()">
              +
            </button>
          </div>
        </div>

        <div class="resend-options-wrapper">
          <div class="topic-selection">
            <div class="drawer-section-title">To topic:</div>
            <mat-form-field>
              <mat-select class="select select-topic"
                          formControlName="destinationTopicName"
                          (valueChange)="setPartitionsOnDestTopicChanged($event)">
                <mat-option>
                  <ngx-mat-select-search placeholderLabel="Search topic.."
                                         [formControl]="destinationTopicFilterCtrl">
                  </ngx-mat-select-search>
                </mat-option>
                <mat-option *ngFor="let topic of destinationFilteredTopics$ | async"
                            [value]="topic.caption()">
                  {{topic.caption()}}
                </mat-option>
              </mat-select>
            </mat-form-field>
          </div>
          <div class="partition-selection">
            <div class="drawer-section-title">On partition:</div>
            <mat-form-field>
              <mat-select class="select"
                          formControlName="destinationTopicPartition">
                <mat-option [value]="-1">None</mat-option>
                <mat-option *ngFor="let partition of destPartitions"
                            value="{{partition}}">
                  {{partition}}
                </mat-option>
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
          <button mat-button
                  disableRipple
                  class="action-button-black"
                  type="submit"
                  [disabled]="resendForm.invalid">
            Resend events
          </button>
        </div>
      </form>
    </mat-dialog-content>
  `,
  styleUrls: ['./resend.component.scss']
})
export class ResendComponent implements OnInit, OnDestroy {

  topics: TopicMetadata[] = [];
  srcPartitions: number[];
  destPartitions: number[];

  sourceTopicNameCtrl: FormControl = new FormControl<string>('', Validators.required);
  sourceTopicFilterCtrl: FormControl = new FormControl<string>('', Validators.required);

  destinationTopicNameCtrl: FormControl = new FormControl<string>('', Validators.required);
  destinationTopicFilterCtrl: FormControl = new FormControl<string>('');

  resendForm: FormGroup = new FormGroup({
    'sourceTopicName': this.sourceTopicNameCtrl,
    'sourceTopicPartition': new FormControl<number>(-1),
    'offsetBeginning': new FormControl<number>(1, [Validators.min(1), Validators.required]),
    'offsetEnd': new FormControl<number>(1, [Validators.min(1), Validators.required]),
    'destinationTopicName': this.destinationTopicNameCtrl,
    'destinationTopicPartition': new FormControl<number>(-1)
  });

  sourceFilteredTopics$: ReplaySubject<TopicMetadata[]> = new ReplaySubject<TopicMetadata[]>(1);
  destinationFilteredTopics$: ReplaySubject<TopicMetadata[]> = new ReplaySubject<TopicMetadata[]>(1);
  private _onDestroy$: Subject<void> = new Subject<void>();

  messageData$: Observable<MessageData> = combineLatest([
    this.messageDataService.messageData$
    ]).pipe(
    tap(([messageData]) => {
      this.resendForm.get('sourceTopicName').setValue(messageData.topicName);
    }),
    map(([messageData]) => messageData)
  );

  constructor(
    private resendService: ResendService,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private servers: ServersService,
    private topicsService: TopicsService,
    private messageDataService: MessageDataService) {
  }

  ngOnInit(): void {
    this.topicsService.getTopics$(this.servers.getSelectedServerId())
      .pipe(first())
      .subscribe((data: Topics) => {
        this.topics = data.topics
          .map(t => new TopicMetadata(t.partitions, null, t.name));
        this.sourceFilteredTopics$.next(this.topics.slice());
        this.destinationFilteredTopics$.next(this.topics.slice());
        this.setPartitionsOnSrcTopicChanged(this.resendForm.value['sourceTopicName']);

        this.sourceTopicFilterCtrl.valueChanges
          .pipe(takeUntil(this._onDestroy$))
          .subscribe(() => {
            this.filterTopics(this.sourceTopicFilterCtrl, this.sourceFilteredTopics$);
          });

        this.destinationTopicFilterCtrl.valueChanges
          .pipe(takeUntil(this._onDestroy$))
          .subscribe(() => {
            this.filterTopics(this.destinationTopicFilterCtrl, this.destinationFilteredTopics$);
          });
      });
  }

  ngOnDestroy(): void {
    this._onDestroy$.next(null);
    this._onDestroy$.complete();
  }

  setPartitionsOnSrcTopicChanged(selectedTopicName: string): void {
    this.srcPartitions = Array.from(Array(
      this.topics.find(t => t.name === selectedTopicName).partitions).keys()
    );
  }

  setPartitionsOnDestTopicChanged(selectedTopicName: string): void {
    this.destPartitions = Array.from(Array(
      this.topics.find(t => t.name === selectedTopicName).partitions).keys()
    );
  }

  filterTopics(topicFilterControl: FormControl, filteredTopics$: ReplaySubject<TopicMetadata[]>): void {
    if (!this.topics) {
      return;
    }

    let search: string = topicFilterControl.value;
    if (!search) {
      filteredTopics$.next(this.topics.slice());
      return;
    } else {
      search = search.toLowerCase();
    }

    filteredTopics$.next(
      this.topics.filter(topic => topic.name.toLowerCase().indexOf(search) > -1)
    );
  }

  onSubmit(): void {
    const resendData: ResendDataModel = {...this.resendForm.value};
    console.log(resendData);
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

  increaseFromOffsetCount(): void {
    const offsetBeginning = this.resendForm.get('offsetBeginning');
    offsetBeginning.setValue(offsetBeginning.value + 1);
  }

  decreaseFromOffsetCount(): void {
    const offsetBeginning = this.resendForm.get('offsetBeginning');
    if (offsetBeginning.value > 1) {
      offsetBeginning.setValue(offsetBeginning.value - 1);
    }
  }

  increaseToOffsetCount(): void {
    const offsetEnd = this.resendForm.get('offsetEnd');
    offsetEnd.setValue(offsetEnd.value + 1);
  }

  decreaseToOffsetCount(): void {
    const offsetEnd = this.resendForm.get('offsetEnd');
    if (offsetEnd.value > 1) {
      offsetEnd.setValue(offsetEnd.value - 1);
    }
  }

}
