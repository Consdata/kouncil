import {Injectable} from '@angular/core';
import {TopicMetadata, Topics} from '@app/common-model';
import {Observable, Subject} from 'rxjs';
import {ServersService} from '@app/common-servers';
import {TopicsService} from '@app/feat-topics';
import {first} from 'rxjs/operators';
import {FormControl} from '@angular/forms';
import {ResendFormService} from './resend-form.service';

@Injectable()
export class ResendFilterService {

  private topics: TopicMetadata[] = [];

  private srcPartitions$: Subject<number[]> = new Subject<number[]>();
  private destPartitions$: Subject<number[]> = new Subject<number[]>();
  private sourceFilteredTopics$: Subject<TopicMetadata[]> = new Subject<TopicMetadata[]>();
  private destinationFilteredTopics$: Subject<TopicMetadata[]> = new Subject<TopicMetadata[]>();

  public srcPartitionsObs$: Observable<number[]> = this.srcPartitions$.asObservable();
  public destPartitionsObs$: Observable<number[]> = this.destPartitions$.asObservable();
  public sourceFilteredTopicsObs$: Observable<TopicMetadata[]> = this.sourceFilteredTopics$.asObservable();
  public destinationFilteredTopicsObs$: Observable<TopicMetadata[]> = this.destinationFilteredTopics$.asObservable();

  constructor(
    private resendFormService: ResendFormService,
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
    this.setPartitionsOnTopicChanged(selectedTopicName, 'sourceTopicPartition', this.srcPartitions$, 0);
  }

  public setPartitionsOnDestTopicChanged(selectedTopicName: string): void {
    this.setPartitionsOnTopicChanged(selectedTopicName, 'destinationTopicPartition', this.destPartitions$, -1);
  }

  public filterSrcTopics(sourceTopicFilterCtrl: FormControl): void {
    this.filterTopics(sourceTopicFilterCtrl, this.sourceFilteredTopics$);
  }

  public filterDestTopics(destinationTopicFilterCtrl: FormControl): void {
    this.filterTopics(destinationTopicFilterCtrl, this.destinationFilteredTopics$);
  }

  private setPartitionsOnTopicChanged(selectedTopicName: string, formPartitionName: string,
                                      topicPartitions$: Subject<number[]>, defaultValue: number): void {
    const partitions = this.topics.find(t => t.name === selectedTopicName).partitions;

    if (partitions <= 1 && defaultValue < 0) {
      topicPartitions$.next([]);
    } else {
      topicPartitions$.next(Array.from(Array(partitions).keys()));
    }

    this.resendFormService.resendForm.get(formPartitionName)?.setValue(defaultValue);
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
