import {Component, EventEmitter, Input, Output} from '@angular/core';

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

  liveState = false;
  showHeaderColumns = true;

  constructor() {
  }

  toggleLive() {
    if (this.liveState) {
      this.toggleLiveEvent.emit(LiveUpdateState.PLAY);
    } else {
      this.toggleLiveEvent.emit(LiveUpdateState.PAUSE);
    }
  }

  openSendPopup() {
    this.openSendPopupEvent.emit();
  }

  toggleHeaders() {
    this.toggleHeadersEvent.emit(this.showHeaderColumns);
  }
}

export enum LiveUpdateState {
  PLAY = 'play',
  PAUSE = 'pause'
}

