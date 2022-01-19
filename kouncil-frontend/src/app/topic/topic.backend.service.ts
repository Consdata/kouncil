import {Injectable} from '@angular/core';
import {TopicService} from './topic.service';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {TopicMessages} from './topic-messages';
import {Page} from './page';
import {HttpClient, HttpParams} from '@angular/common/http';
import {ProgressBarService} from '../util/progress-bar.service';

@Injectable({
  providedIn: 'root'
})
export class TopicBackendService implements TopicService {

  partitionOffsets: { [key: number]: number } = {};
  partitionEndOffsets: { [key: number]: number } = {};
  partitions: number[];
  selectedPartition: string;
  convertTopicMessagesJsonToGrid$: Subject<TopicMessages> = new Subject<TopicMessages>();
  numberOfPartitionsChanged$: Subject<number> = new Subject<number>();
  paginationChanged$: BehaviorSubject<Page>;

  constructor(public http: HttpClient, public progressBarService: ProgressBarService) {
    this.initPaging();
  }

  getMessages(serverId: string, topicName: string, offset?: number): void {
    let url;
    if (typeof this.selectedPartition !== 'undefined') {
      url = `/api/topic/messages/${topicName}/${this.selectedPartition}`;
    } else {
      url = `/api/topic/messages/${topicName}/all`;
    }
    const paging = this.paginationChanged$.getValue();
    let params = new HttpParams()
      .set('serverId', serverId)
      .set('page', String(paging.pageNumber))
      .set('limit', String(paging.size));
    if (!!offset || offset === 0) {
      params = params.set('offset', String(offset));
    }

    this.http.get(url, {params}).subscribe((data: TopicMessages) => {
      this.processMessagesData(data);
    });
  }

  processMessagesData(data: TopicMessages): void {
    this.partitionOffsets = data.partitionOffsets;
    this.partitionEndOffsets = data.partitionEndOffsets;
    const paging = this.paginationChanged$.getValue();
    paging.totalElements = data.totalResults;
    this.convertTopicMessagesJsonToGrid$.next(data);
    this.progressBarService.setProgress(false);
    this.partitions = Array.from({length: Object.values(this.partitionOffsets).length}, (v, i) => i);
    if (typeof this.selectedPartition === 'undefined') {
      this.selectedPartition = 'all';
      this.numberOfPartitionsChanged$.next(this.partitions.length);
    }
  }

  selectPartition(serverId: string, partition: number, topicName: string): void {
    this.selectedPartition = partition.toString();
    this.progressBarService.setProgress(true);
    this.getMessages(serverId, topicName);
  }

  selectAllPartitions(serverId: string, topicName: string): void {
    this.selectedPartition = 'all';
    this.progressBarService.setProgress(true);
    this.getMessages(serverId, topicName);
  }

  getConvertTopicMessagesJsonToGridObservable(): Observable<TopicMessages> {
    return this.convertTopicMessagesJsonToGrid$.asObservable();
  }

  getNumberOfPartitionsObservable(): Observable<number> {
    return this.numberOfPartitionsChanged$.asObservable();
  }

  paginateMessages(serverId: string, event: any, topicName: string): void {
    const paging = this.paginationChanged$.getValue();
    paging.pageNumber = event.page;
    this.paginationChanged$ = new BehaviorSubject<Page>(paging);
    this.getMessages(serverId, topicName);
  }

  initPaging(): void {
    const paging = new Page();
    paging.pageNumber = 1;
    paging.size = 10;
    this.paginationChanged$ = new BehaviorSubject<Page>(paging);
  }

  getPagination$(): Observable<Page> {
    return this.paginationChanged$.asObservable();
  }

  goToOffset(serverId: string, topicName: string, offset: number): void {
    this.getMessages(serverId, topicName, offset);
  }
}
