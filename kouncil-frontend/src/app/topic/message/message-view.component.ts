import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {SendComponent} from '../../send/send.component';
import {DrawerService} from '../../util/drawer.service';
import {MessageHeader} from '../message-header';
import {first} from 'rxjs/operators';

@Component({
  selector: 'app-message-view',
  templateUrl: './message-view.component.html',
  styleUrls: ['./message-view.component.scss']
})
export class MessageViewComponent implements OnInit {
  public isAnimationDone = false;
  constructor(
    private drawerService: DrawerService,
    private dialogRef: MatDialogRef<MessageViewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      topicName: string,
      key: string,
      source: string,
      headers: MessageHeader[]
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
      source: this.data.source,
      headers: this.data.headers
    });
  }

  ngOnInit(): void {
    // ngx datatable gets its width completely wrong
    // if displayed before container reaches its final size
    this.dialogRef.afterOpened().pipe(first()).subscribe(() => {
      this.isAnimationDone = true;
    });
  }

}
