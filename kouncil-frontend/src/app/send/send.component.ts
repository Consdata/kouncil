import {Component, Inject, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Message} from 'app/topic/message';
import {FormControl, Validators} from '@angular/forms';
import {SendService} from './send.service';
import {first} from 'rxjs/operators';
import {MAT_DIALOG_DATA, MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-send',
  templateUrl: './send.component.html',
  styleUrls: ['./send.component.scss']
})
export class SendComponent implements OnChanges {

  @ViewChild('sendForm') sendForm: any;

  message: Message = new Message('', '', null, null, null);

  countControl = new FormControl(1, [Validators.min(1), Validators.required]);

  constructor(private http: HttpClient,
              private sendService: SendService,
              private dialog: MatDialog,
              private snackbar: MatSnackBar,
              @Inject(MAT_DIALOG_DATA) public data: {
                topicName: string,
                key: string,
                source: string
              }) {
    console.log(this.data);
    this.message.key = this.data.key;
    this.message.value = JSON.stringify(this.data.source);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.key) {
      this.message.key = changes.key.currentValue;
    }
    if (changes.value) {
      this.message.value = changes.value.currentValue;
    }
  }

  onSubmit() {
    this.sendService.send(this.data.topicName, this.countControl.value, this.message)
      .pipe(first())
      .subscribe(data => {
        this.dialog.closeAll();
        this.resetForm();
        this.snackbar.open(`Successfully sent to ${this.data.topicName}`, '', {
          duration: 3000,
          panelClass: ['snackbar-success', 'snackbar']
        });
      });
  }

  increaseCount() {
    this.countControl.setValue(this.countControl.value + 1);
  }

  decreaseCount() {
    if (this.countControl.value > 1) {
      this.countControl.setValue(this.countControl.value - 1);
    }
  }

  cancel() {
    this.dialog.closeAll();
    this.resetForm();
  }

  resetForm() {
    this.sendForm.reset({value: '', key: ''});
    this.countControl.reset(1);
  }
}
