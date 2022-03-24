import {Component, EventEmitter, Input, Output} from '@angular/core';
import {TopicService} from '../topic.service';
import {ServersService} from '../../servers.service';

export enum LiveUpdateState {
  PLAY = 'play',
  PAUSE = 'pause'
}

@Component({
  selector: 'app-kafka-toolbar',
  template:`
    <div class="kafka-toolbar">
      <app-breadcrumb [parentName]="'Topics'" [parentLink]="'/topics'" [name]="name"></app-breadcrumb>
      <div class="spacer"></div>
      <mat-slide-toggle [class.active]="showJsonColumns === true" disableRipple class="switch" (change)="toggleJson()" [(ngModel)]="showJsonColumns">
        JSON
      </mat-slide-toggle>
      <mat-slide-toggle [class.active]="showHeaderColumns === true" disableRipple class="switch" (change)="toggleHeaders()" [(ngModel)]="showHeaderColumns">
        Headers
      </mat-slide-toggle>
      <mat-slide-toggle [class.active]="liveState === true" disableRipple class="switch" (change)="toggleLive()" [(ngModel)]="liveState">
        Live update
        <div class="circle"></div>
      </mat-slide-toggle>
      <app-topic-partitions [topicName]="name" (partitionSelected)="clearOffset()"></app-topic-partitions>
      <div class="offset-wrapper">
        <input class="offset-input" placeholder="Offset" matInput type="number" min="0" name="value" [(ngModel)]="offset"/>
        <button mat-button class="action offset-search-button" (click)="goToOffset()"><span class="search-icon"></span></button>
      </div>
      <button mat-button class="action" (click)="openSendPopup()">Send event</button>
    </div>
  `,
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent {

  @Input() name?: string;
  @Output() toggleLiveEvent: EventEmitter<LiveUpdateState> = new EventEmitter<LiveUpdateState>();
  @Output() openSendPopupEvent: EventEmitter<void> = new EventEmitter<void>();
  @Output() toggleHeadersEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() toggleJsonEvent: EventEmitter<boolean> = new EventEmitter<boolean>();

  liveState: boolean = false;
  showHeaderColumns: boolean = true;
  showJsonColumns: boolean = true;
  offset?: number;

  constructor(private topicService: TopicService, private servers: ServersService) {
  }

  toggleLive(): void {
    if (this.liveState) {
      this.toggleLiveEvent.emit(LiveUpdateState.PLAY);
    } else {
      this.toggleLiveEvent.emit(LiveUpdateState.PAUSE);
    }
  }

  goToOffset(): void {
    this.topicService.goToOffset(this.servers.getSelectedServerId(), this.name, this.offset);
  }

  clearOffset(): void {
    this.offset = undefined;
  }

  openSendPopup(): void {
    this.openSendPopupEvent.emit();
  }

  toggleHeaders(): void {
    this.toggleHeadersEvent.emit(this.showHeaderColumns);
  }

  toggleJson(): void {
    this.toggleJsonEvent.emit(this.showJsonColumns);
  }
}
