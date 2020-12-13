import {Component, OnDestroy, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {SearchService} from "app/search.service";
import {Subscription} from "rxjs";
import {ActivatedRoute} from "@angular/router";
import {ConsumerGroupOffset, ConsumerGroupResponse} from "app/consumers/consumer-group/consumer-group";

@Component({
  selector: 'kafka-consumer-group',
  templateUrl: './consumer-group.component.html',
  styleUrls: ['./consumer-group.component.scss']
})
export class ConsumerGroupComponent implements OnInit, OnDestroy {

  groupId: string;
  allAssignments: ConsumerGroupOffset[];
  filteredAssignments: ConsumerGroupOffset[];
  private subscription: Subscription;
  phrase: string;
  paused: boolean;
  lastLags: IHash = {};
  constructor(private http: HttpClient,
              private searchService: SearchService,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.paused = false;
    this.route.params.subscribe(params => {
      this.groupId = params['groupId'];
      this.getConsumerGroup();
    });

    this.subscription = this.searchService.getState().subscribe(
      phrase => {
        this.phrase = phrase;
        this.filter();
      });
  }

  ngOnDestroy() {
    this.paused = true;
    this.subscription.unsubscribe();
  }

  private getConsumerGroup() {
    if (this.paused) {
      return;
    }
    this.http.get("/api/consumer-group/" + this.groupId)
        .subscribe(data => {
          this.allAssignments = (<ConsumerGroupResponse> data).consumerGroupOffset;
          this.calculateLags();
          this.filter();
          setTimeout(() => this.getConsumerGroup(), 1000);
        });
  }

  private filter() {
    this.filteredAssignments = this.allAssignments.filter((consumerGroupOffset) => {
      return !this.phrase || JSON.stringify(consumerGroupOffset).toLowerCase().indexOf(this.phrase.toLowerCase()) > -1;
    });
  }

  private calculateLags() {
    this.allAssignments.forEach(consumerGroupOffset => {
      let lag: number = !!consumerGroupOffset.offset ? consumerGroupOffset.endOffset - consumerGroupOffset.offset : 0;
      consumerGroupOffset.lag = lag;
      consumerGroupOffset.pace = lag - this.lastLags[consumerGroupOffset.clientId];
      this.lastLags[consumerGroupOffset.clientId] = lag;
    })
  }
}

export interface IHash {
  [details: string]: number;
}
