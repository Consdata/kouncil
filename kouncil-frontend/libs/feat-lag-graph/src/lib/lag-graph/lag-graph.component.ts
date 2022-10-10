import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {map} from 'rxjs/operators';
import {MessageData, MessageDataService} from '@app/message-data';
import {combineLatest, Observable, Subject} from 'rxjs';


@Component({
  selector: 'app-lag-graph',
  template: `
    <mat-dialog-content *ngIf="messageData$ | async as messageData">
      <div class="drawer-header">
        <div class="drawer-title">Resend events from {{messageData.topicName}}</div>
        <div class="spacer"></div>
        <mat-icon mat-dialog-close class="close">close</mat-icon>
      </div>

      TEST
    </mat-dialog-content>
  `,
  styleUrls: ['./lag-graph.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LagGraphComponent implements OnInit, OnDestroy {

  private _onDestroy$: Subject<void> = new Subject<void>();

  messageData$: Observable<MessageData> = combineLatest([
    this.messageDataService.messageData$
  ]).pipe(
    map(([messageData]) => messageData)
  );

  constructor(
    private messageDataService: MessageDataService) {
  }

  ngOnInit(): void {
    // todo
  }

  ngOnDestroy(): void {
    this._onDestroy$.next();
    this._onDestroy$.complete();
  }

}
