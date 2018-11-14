import { Component, OnInit } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { SearchService } from "app/search.service";
import { Subscription } from "rxjs/Subscription";
import { ActivatedRoute } from "@angular/router";
import { Assignment, ConsumerGroupResponse } from "app/consumers/consumer-group/consumer-group";

@Component({
  selector: 'kafka-consumer-group',
  templateUrl: './consumer-group.component.html',
  styleUrls: ['./consumer-group.component.scss']
})
export class ConsumerGroupComponent implements OnInit {

  groupId: string;
  allAssignments: Assignment[];
  filteredAssignments: Assignment[];
  private subscription: Subscription;
  phrase: string;

  constructor(private http: HttpClient, private searchService: SearchService, private route: ActivatedRoute) {
  }

  ngOnInit() {
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
    this.subscription.unsubscribe();
  }

  private getConsumerGroup() {
    this.http.get("/api/consumer-group/" + this.groupId)
        .subscribe(data => {
          this.allAssignments = (<ConsumerGroupResponse> data).assignments;
          this.calculateLags();
          this.filter();
        });
  }

  private filter() {
    this.filteredAssignments = this.allAssignments.filter((assignment) => {
      return !this.phrase || JSON.stringify(assignment).toLowerCase().indexOf(this.phrase.toLowerCase()) > -1;
    });
  }

  private calculateLags() {
    this.allAssignments.forEach(assignment => {
      assignment.lag = !!assignment.offset ? assignment.endOffset - assignment.offset : null;
    })
  }
}
