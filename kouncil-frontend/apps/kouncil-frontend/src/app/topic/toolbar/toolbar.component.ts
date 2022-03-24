import {Component, EventEmitter, Input, Output} from '@angular/core';
import {TopicService} from '../topic.service';
import {ServersService} from '../../servers.service';

@Component({
  selector: 'app-kafka-toolbar',
  templateUrl: './toolbar.component.html',
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

export enum LiveUpdateState {
  PLAY = 'play',
  PAUSE = 'pause'
}

