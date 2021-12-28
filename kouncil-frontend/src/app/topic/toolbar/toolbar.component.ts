import {Component, EventEmitter, Input, Output} from '@angular/core';
import {TopicService} from '../topic.service';
import {ServersService} from '../../servers.service';

@Component({
  selector: 'app-kafka-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent {

  @Input() name: string;
  @Output() toggleLiveEvent: EventEmitter<LiveUpdateState> = new EventEmitter();
  @Output() openSendPopupEvent: EventEmitter<any> = new EventEmitter();
  @Output() toggleHeadersEvent: EventEmitter<boolean> = new EventEmitter();
  @Output() toggleJsonEvent: EventEmitter<boolean> = new EventEmitter();

  liveState = false;
  showHeaderColumns = true;
  showJsonColumns = true;
  offset: number;

  constructor(private topicService: TopicService, private servers: ServersService) {
  }

  toggleLive() {
    if (this.liveState) {
      this.toggleLiveEvent.emit(LiveUpdateState.PLAY);
    } else {
      this.toggleLiveEvent.emit(LiveUpdateState.PAUSE);
    }
  }

  goToOffset() {
    this.topicService.goToOffset(this.servers.getSelectedServerId(), this.name, this.offset);
  }

  clearOffset() {
    this.offset = undefined;
  }

  openSendPopup() {
    this.openSendPopupEvent.emit();
  }

  toggleHeaders() {
    this.toggleHeadersEvent.emit(this.showHeaderColumns);
  }

  toggleJson() {
    this.toggleJsonEvent.emit(this.showJsonColumns);
  }
}

export enum LiveUpdateState {
  PLAY = 'play',
  PAUSE = 'pause'
}

