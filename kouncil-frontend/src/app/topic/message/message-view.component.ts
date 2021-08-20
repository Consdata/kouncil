import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {SendComponent} from '../../send/send.component';
import {DrawerService} from '../../util/drawer.service';
import {MessageHeader} from '../message-header';
import {first} from 'rxjs/operators';
import {Router} from '@angular/router';
import {TrackService} from '../../track/track.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Clipboard} from '@angular/cdk/clipboard';

@Component({
  selector: 'app-message-view',
  templateUrl: './message-view.component.html',
  styleUrls: ['./message-view.component.scss']
})
export class MessageViewComponent implements OnInit {
  public isAnimationDone = false;

  constructor(
    private drawerService: DrawerService,
    private router: Router,
    private trackService: TrackService,
    public snackBar: MatSnackBar,
    private clipboard: Clipboard,
    private dialogRef: MatDialogRef<MessageViewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      topicName: string,
      key: string,
      source: string,
      headers: MessageHeader[],
      timestamp: number
    }) {
  }

  copyToClipboard(object) {
    this.clipboard.copy(JSON.stringify(object, null, 2));
    this.snackBar.open('Copied successfully', '', {
      duration: 1000,
      panelClass: ['snackbar-info', 'snackbar']
    });
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

  navigateToTrack(event): void {
    const element = event.event.target as HTMLElement;
    if (event.type === 'click' && element.nodeName !== 'MAT-ICON' && element.nodeName !== 'BUTTON') {
      this.dialogRef.close();
      this.trackService.storeTrackFilter(event.row.key, event.row.value, this.data.timestamp, this.data.topicName);
      this.router.navigate(['/track']);
    }
  }

}
