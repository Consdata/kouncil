import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {SendComponent} from '../../send/send.component';

@Component({
  selector: 'app-message-view',
  templateUrl: './message-view.component.html',
  styleUrls: ['./message-view.component.scss']
})
export class MessageViewComponent implements OnInit {

  constructor(
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<MessageViewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      topicName: string,
      key: string,
      source: string
  }) {
  }

  formatJson(object) {
    return JSON.stringify(object, null, 2);
  }

  resend() {
    this.dialogRef.close();
    this.dialog.open(SendComponent, {
      data: {
        topicName: this.data.topicName,
        key: this.data.key,
        source: this.data.source
      },
      height: '100%',
      width: '787px',
      position: {
        right: '0px'
      },
      panelClass: ['app-drawer', 'dialog-with-padding']
    });
  }

  ngOnInit(): void {
  }

}
