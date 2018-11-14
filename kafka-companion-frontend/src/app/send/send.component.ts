import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { Message } from "app/topic/message";

@Component({
  selector: 'app-send',
  templateUrl: './send.component.html',
  styleUrls: ['./send.component.scss']
})
export class SendComponent implements OnInit {

  topicName: string;
  message: Message = new Message("", "", null, null, null);
  count: number = 1;

  constructor(private route: ActivatedRoute, private http: HttpClient) {
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.topicName = params['topic'];
    });
  }

  onSubmit() {
    this.http.post(`/api/topic/send/${this.topicName}/${this.message.key}/${this.count}`, this.message.value).subscribe(data => {
      console.log("done");
    });
  }

}
