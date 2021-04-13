import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'kafka-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {

  @Input() name: string;
  @Output() onAction: EventEmitter<any> = new EventEmitter();
  @Output() onOpenSendPopup: EventEmitter<any> = new EventEmitter();

  online: boolean = false;

  constructor() {
  }

  ngOnInit() {
  }

  onChange() {
    if(this.online) {
      this.onAction.emit("play");
    } else {
      this.onAction.emit("pause");
    }
  }

  onPause() {
    this.onAction.emit("pause");
  }

  onPlay() {
    this.onAction.emit("play");
  }

  openSendPopup() {
    this.onOpenSendPopup.emit();
  }
}
