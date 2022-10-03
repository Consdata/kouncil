import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {first, map, takeUntil, tap} from 'rxjs/operators';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MessageData, MessageDataService} from '@app/message-data';
import {combineLatest, Observable, Subject} from 'rxjs';
import {ResendService} from './resend.service';
import {ResendDataModel} from './resend.data.model';
import {ResendFilterService} from './resend.filter.service';
import {ServersService} from '@app/common-servers';

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
                          (valueChange)="resendFilterService.setPartitionsOnSrcTopicChanged($event)">
                <mat-option>
                  <ngx-mat-select-search placeholderLabel="Search topic.."
                                         [formControl]="sourceTopicFilterCtrl">
                  </ngx-mat-select-search>
                </mat-option>
                <mat-option *ngFor="let topic of resendFilterService.sourceFilteredTopicsObs$ | async"
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
                <mat-option *ngFor="let partition of resendFilterService.srcPartitionsObs$ | async"
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
          <div class="offset-input-fields">
            <input matInput type="number" min="1" formControlName="offsetBeginning"/>
          </div>

          <div class="drawer-section-title">To:</div>
          <div class="offset-input-fields">
            <input matInput type="number" min="1" formControlName="offsetEnd"/>
          </div>
        </div>

        <div class="resend-options-wrapper">
          <div class="topic-selection">
            <div class="drawer-section-title">To topic:</div>
            <mat-form-field>
              <mat-select class="select select-topic"
                          formControlName="destinationTopicName"
                          (valueChange)="resendFilterService.setPartitionsOnDestTopicChanged($event)">
                <mat-option>
                  <ngx-mat-select-search placeholderLabel="Search topic.."
                                         [formControl]="destinationTopicFilterCtrl">
                  </ngx-mat-select-search>
                </mat-option>
                <mat-option *ngFor="let topic of resendFilterService.destinationFilteredTopicsObs$ | async"
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
                <mat-option *ngFor="let partition of resendFilterService.destPartitionsObs$ | async"
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
  styleUrls: ['./resend.component.scss'],
  providers: [ResendFilterService]
})
export class ResendComponent implements OnInit, OnDestroy {

  sourceTopicFilterCtrl: FormControl = new FormControl<string>('', Validators.required);
  destinationTopicFilterCtrl: FormControl = new FormControl<string>('', Validators.required);

  resendForm: FormGroup = new FormGroup({
    'sourceTopicName': new FormControl<string>('', Validators.required),
    'sourceTopicPartition': new FormControl<number>(-1),
    'offsetBeginning': new FormControl<number>(1, [Validators.min(1), Validators.required]),
    'offsetEnd': new FormControl<number>(1, [Validators.min(1), Validators.required]),
    'destinationTopicName': new FormControl<string>('', Validators.required),
    'destinationTopicPartition': new FormControl<number>(-1)
  });

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
    public resendFilterService: ResendFilterService,
    private resendService: ResendService,
    private servers: ServersService,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private messageDataService: MessageDataService) {
  }

  ngOnInit(): void {
    this.resendFilterService.init().then(() => {
      this.resendFilterService.setPartitionsOnSrcTopicChanged(this.resendForm.value['sourceTopicName']);

      this.sourceTopicFilterCtrl.valueChanges
        .pipe(takeUntil(this._onDestroy$))
        .subscribe(() => {
          this.resendFilterService.filterSrcTopics(this.sourceTopicFilterCtrl);
        });

      this.destinationTopicFilterCtrl.valueChanges
        .pipe(takeUntil(this._onDestroy$))
        .subscribe(() => {
          this.resendFilterService.filterDestTopics(this.destinationTopicFilterCtrl);
        });
    });
  }

  ngOnDestroy(): void {
    this._onDestroy$.next();
    this._onDestroy$.complete();
  }

  onSubmit(): void {
    const resendData: ResendDataModel = {...this.resendForm.value};
    console.log('resendData=', resendData);
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

}
