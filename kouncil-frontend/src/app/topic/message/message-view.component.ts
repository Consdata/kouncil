import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-message-view',
  templateUrl: './message-view.component.html',
  styleUrls: ['./message-view.component.scss']
})
export class MessageViewComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: {
    source: string
  }) {
  }

  formatJson(object) {
    return JSON.stringify(object, null, 2);
  }

  ngOnInit(): void {
  }

}
