import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Message} from "app/topic/message";

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
  message: Message = new Message("", "", null, null, null);
  count: number = 1;

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
    this.http.post(`/api/topic/send/${this.topicName}/${this.count}`, this.message).subscribe(data => {
      this.onClose.emit(true);
    });
  }

  cancel() {
    this.onClose.emit(false);
  }

}
