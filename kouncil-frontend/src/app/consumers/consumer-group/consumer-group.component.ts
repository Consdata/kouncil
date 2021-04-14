import {Component, OnDestroy, OnInit} from '@angular/core';
import {SearchService} from 'app/search.service';
import {Subscription} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {ConsumerGroupOffset, ConsumerGroupResponse} from 'app/consumers/consumer-group/consumer-group';
import {ProgressBarService} from '../../util/progress-bar.service';
import {ConsumerGroupService} from './consumer-group.service';
import {first} from 'rxjs/operators';

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

  constructor(private searchService: SearchService,
              private route: ActivatedRoute,
              private progressBarService: ProgressBarService,
              private consumerGroupService: ConsumerGroupService) {
  }

  ngOnInit() {
    this.paused = false;
    this.progressBarService.setProgress(true);
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

  isLoading(): boolean {
    return this.progressBarService.progressSub.getValue();
  }

  private getConsumerGroup() {
    if (this.paused) {
      return;
    }

    this.consumerGroupService.getConsumerGroup(this.groupId)
      .pipe(first())
      .subscribe(data => {
        this.allAssignments = (<ConsumerGroupResponse>data).consumerGroupOffset;
        this.calculateLags();
        this.filter();
        this.progressBarService.setProgress(false);
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
      const lag: number = !!consumerGroupOffset.offset ? consumerGroupOffset.endOffset - consumerGroupOffset.offset : 0;
      consumerGroupOffset.lag = lag;
      consumerGroupOffset.pace = lag - this.lastLags[consumerGroupOffset.clientId];
      this.lastLags[consumerGroupOffset.clientId] = lag;
    });
  }
}

export interface IHash {
  [details: string]: number;
}
