import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-kafka-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent {

  @Input() name: string;
  @Output() onAction: EventEmitter<any> = new EventEmitter();
  @Output() onOpenSendPopup: EventEmitter<any> = new EventEmitter();
  @Output() onToggleHeaders: EventEmitter<any> = new EventEmitter();

  online = false;
  headers = true;

  constructor() {
  }

  onChange() {
    if (this.online) {
      this.onAction.emit(LiveUpdateState.PLAY);
    } else {
      this.onAction.emit(LiveUpdateState.PAUSE);
    }
  }

  openSendPopup() {
    this.onOpenSendPopup.emit();
  }

  toggleHeaders() {
    this.onToggleHeaders.emit();
  }
}

export enum LiveUpdateState {
  PLAY = 'play',
  PAUSE = 'pause'
}

