import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { Location } from '@angular/common';
import { HttpClient } from "@angular/common/http";
import { Message } from "app/topic/message";

@Component({
  selector: 'app-send',
  templateUrl: './send.component.html',
  styleUrls: ['./send.component.scss']
})
export class SendComponent implements OnInit {

  topicName: string;
  returnUrl: string;
  message: Message = new Message("", "", null, null, null);
  count: number = 1;

  constructor(private route: ActivatedRoute, private http: HttpClient, private _location: Location) {
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.topicName = params['topic'];
      this.returnUrl = params.returnUrl;
    });
  }

  onSubmit() {
    this.http.post(`/api/topic/send/${this.topicName}/${this.count}`, this.message).subscribe(data => {
      this._location.back();
    });
  }

  cancel() {
      this._location.back();
  }

}
