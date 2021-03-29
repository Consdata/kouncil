import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Message} from "app/topic/message";
import {FormControl, Validators} from "@angular/forms";

@Component({
  selector: 'app-send',
  templateUrl: './send.component.html',
  styleUrls: ['./send.component.scss']
})
export class SendComponent implements OnChanges {

  @Input('topicName') topicName: string;
  @Input('key') key: string;
  @Input('value') value: string;
  @Output() onClose: EventEmitter<any> = new EventEmitter();
  @ViewChild('heroForm') sendForm: any;
  message: Message = new Message("", "", null, null, null);
  countControl = new FormControl(1, [Validators.min(1), Validators.required]);

  constructor(private http: HttpClient) {
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
    this.http.post(`/api/topic/send/${this.topicName}/${this.countControl.value}`, this.message).subscribe(data => {
      this.onClose.emit(true);
      this.resetForm();
    });
  }

  cancel() {
    this.onClose.emit(false);
    this.resetForm();
  }

  resetForm() {
    this.sendForm.reset({value: '', key: ''});
    this.countControl.reset(1);
  }
}
