import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {SendComponent} from '../../send/send.component';
import {DrawerService} from '../../util/drawer.service';

@Component({
  selector: 'app-message-view',
  templateUrl: './message-view.component.html',
  styleUrls: ['./message-view.component.scss']
})
export class MessageViewComponent implements OnInit {

  constructor(
    private drawerService: DrawerService,
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
    this.drawerService.openDrawerWithPadding(SendComponent, {
      topicName: this.data.topicName,
      key: this.data.key,
      source: this.data.source
    });
  }

  ngOnInit(): void {
  }

}
