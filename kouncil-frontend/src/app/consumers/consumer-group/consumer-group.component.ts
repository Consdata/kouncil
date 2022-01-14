import {Component, OnDestroy, OnInit} from '@angular/core';
import {SearchService} from 'app/search.service';
import {Subscription} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {ConsumerGroupOffset} from 'app/consumers/consumer-group/consumer-group';
import {ProgressBarService} from '../../util/progress-bar.service';
import {ConsumerGroupService} from './consumer-group.service';
import {first} from 'rxjs/operators';
import {ServersService} from '../../servers.service';

@Component({
  selector: 'app-kafka-consumer-group',
  templateUrl: './consumer-group.component.html',
  styleUrls: ['./consumer-group.component.scss']
})
export class ConsumerGroupComponent implements OnInit, OnDestroy {

  groupId: string;
  allAssignments: ConsumerGroupOffset[];
  filteredAssignments: ConsumerGroupOffset[];
  private searchSubscription: Subscription;
  paused: boolean;
  lastLags: IHash = {};

  constructor(private searchService: SearchService,
              private route: ActivatedRoute,
              private progressBarService: ProgressBarService,
              private consumerGroupService: ConsumerGroupService,
              private servers: ServersService) {
  }

  ngOnInit() {
    this.paused = false;
    this.progressBarService.setProgress(true);
    this.route.params.subscribe(params => {
      this.groupId = params['groupId'];
      this.getConsumerGroup();
    });

    this.searchSubscription = this.searchService.getPhraseState('consumer-group').subscribe(
      phrase => {
        this.filter(phrase);
      });
  }

  ngOnDestroy() {
    this.searchSubscription.unsubscribe();
    this.paused = true;
  }

  isLoading(): boolean {
    return this.progressBarService.progressSub.getValue();
  }

  private getConsumerGroup() {
    if (this.paused) {
      return;
    }

    this.consumerGroupService.getConsumerGroup(this.servers.getSelectedServerId(), this.groupId)
      .pipe(first())
      .subscribe(data => {
        this.allAssignments = data.consumerGroupOffset;
        this.calculateLags();
        this.filter(this.searchService.currentPhrase);
        this.progressBarService.setProgress(false);
        setTimeout(() => this.getConsumerGroup(), 1000);
      });
  }

  private filter(phrase: string) {
    this.filteredAssignments = this.allAssignments.filter((consumerGroupOffset) => {
      return !phrase || JSON.stringify(consumerGroupOffset).toLowerCase().indexOf(phrase.toLowerCase()) > -1;
    });
  }

  private calculateLags() {
    this.allAssignments.forEach(assignment => {
      const lag: number = !!assignment.offset ? assignment.endOffset - assignment.offset : 0;
      assignment.lag = lag;
      const pace: number = lag - this.lastLags[this.getKey(assignment)];
      assignment.pace = isNaN(pace) ? 0 : pace;
      this.lastLags[this.getKey(assignment)] = lag;
    });
  }

  private getKey(assignment: ConsumerGroupOffset) {
    return this.servers.getSelectedServerId() + assignment.clientId + assignment.consumerId + assignment.topic + assignment.partition;
  }
}

export interface IHash {
  [details: string]: number;
}
