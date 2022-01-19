import {Component, Inject, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Message} from 'app/topic/message';
import {FormControl, Validators} from '@angular/forms';
import {SendService} from './send.service';
import {first} from 'rxjs/operators';
import {MAT_DIALOG_DATA, MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ServersService} from '../servers.service';
import {MessageHeader} from '../topic/message-header';

@Component({
  selector: 'app-send',
  templateUrl: './send.component.html',
  styleUrls: ['./send.component.scss']
})
export class SendComponent {

  @ViewChild('sendForm') sendForm: any;

  message: Message;

  countControl = new FormControl(1, [Validators.min(1), Validators.required]);

  constructor(private http: HttpClient,
              private sendService: SendService,
              private dialog: MatDialog,
              private snackbar: MatSnackBar,
              private servers: ServersService,
              @Inject(MAT_DIALOG_DATA) public data: {
                topicName: string,
                key: string,
                source: string,
                headers: MessageHeader[]
              }) {
    console.log(this.data);
    this.message = new Message(
      this.data.key,
      JSON.stringify(this.data.source, null, 2),
      null,
      null,
      null,
      this.data.headers,
      this.data.topicName);
  }

  onSubmit(): void {
    this.sendService.send(this.servers.getSelectedServerId(), this.data.topicName, this.countControl.value, this.message)
      .pipe(first())
      .subscribe(() => {
        this.dialog.closeAll();
        this.resetForm();
        this.snackbar.open(`Successfully sent to ${this.data.topicName}`, '', {
          duration: 3000,
          panelClass: ['snackbar-success', 'snackbar']
        });
      });
  }

  increaseCount(): void {
    this.countControl.setValue(this.countControl.value + 1);
  }

  decreaseCount(): void {
    if (this.countControl.value > 1) {
      this.countControl.setValue(this.countControl.value - 1);
    }
  }

  resetForm(): void {
    this.sendForm.reset({value: '', key: ''});
    this.countControl.reset(1);
  }

  addHeader(): void {
    this.message.headers.push(new MessageHeader('', ''));
  }

  removeHeader(i: number): void {
    this.message.headers.splice(i, 1);
  }

}
