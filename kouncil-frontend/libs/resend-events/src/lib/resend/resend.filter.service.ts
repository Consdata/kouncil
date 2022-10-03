import {Injectable} from '@angular/core';
import {TopicMetadata, Topics} from '@app/common-model';
import {Subject} from 'rxjs';
import {ResendService} from '@app/resend-events';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ServersService} from '@app/common-servers';
import {TopicsService} from '@app/feat-topics';
import {first} from 'rxjs/operators';
import {FormControl} from '@angular/forms';

@Injectable()
export class ResendFilterService {

  private topics: TopicMetadata[] = [];

  private srcPartitions: Subject<number[]> = new Subject<number[]>();
  private destPartitions: Subject<number[]> = new Subject<number[]>();
  private sourceFilteredTopics$: Subject<TopicMetadata[]> = new Subject<TopicMetadata[]>();
  private destinationFilteredTopics$: Subject<TopicMetadata[]> = new Subject<TopicMetadata[]>();

  public srcPartitionsObs$ = this.srcPartitions.asObservable();
  public destPartitionsObs$ = this.destPartitions.asObservable();
  public sourceFilteredTopicsObs$ = this.sourceFilteredTopics$.asObservable();
  public destinationFilteredTopicsObs$ = this.destinationFilteredTopics$.asObservable();

  constructor(
    private resendService: ResendService,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private servers: ServersService,
    private topicsService: TopicsService) {
  }

  public init(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.topicsService.getTopics$(this.servers.getSelectedServerId())
        .pipe(first())
        .subscribe((data: Topics) => {
          this.topics = data.topics
            .map(t => new TopicMetadata(t.partitions, null, t.name));
          this.sourceFilteredTopics$.next(this.topics.slice());
          this.destinationFilteredTopics$.next(this.topics.slice());
          resolve();
        });
    });
  }

  public setPartitionsOnSrcTopicChanged(selectedTopicName: string): void {
    const partitions = this.topics.find(t => t.name === selectedTopicName).partitions;
    if (partitions <= 1) {
      this.srcPartitions.next([]);
    } else {
      this.srcPartitions.next(Array.from(Array(partitions).keys()));
    }
  }

  public setPartitionsOnDestTopicChanged(selectedTopicName: string): void {
    const partitions = this.topics.find(t => t.name === selectedTopicName).partitions;
    if (partitions <= 1) {
      this.destPartitions.next([]);
    } else {
      this.destPartitions.next(Array.from(Array(partitions).keys()));
    }
  }

  public filterSrcTopics(sourceTopicFilterCtrl: FormControl) {
    this.filterTopics(sourceTopicFilterCtrl, this.sourceFilteredTopics$);
  }

  public filterDestTopics(destinationTopicFilterCtrl: FormControl) {
    this.filterTopics(destinationTopicFilterCtrl, this.destinationFilteredTopics$);
  }

  private filterTopics(topicFilterControl: FormControl, filteredTopics$: Subject<TopicMetadata[]>): void {
    if (!this.topics) {
      return;
    }

    let search: string = topicFilterControl.value;
    if (!search) {
      filteredTopics$.next(this.topics.slice());
      return;
    } else {
      search = search.trim().toLowerCase();
    }

    filteredTopics$.next(
      this.topics.filter(topic => topic.name.toLowerCase().indexOf(search) > -1)
    );
  }

}
