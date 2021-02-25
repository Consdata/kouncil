import {TopicMessages} from './topic';
import {HttpClient} from '@angular/common/http';
import {ProgressBarService} from '../util/progress-bar.service';
import {Observable, Subject} from 'rxjs';
import {Injectable} from '@angular/core';

@Injectable()
export class TopicService {
  readonly VISIBLE_PARTITION_QUANTITY: number = 10;

  partitionOffsets: { [key: number]: number } = {};
  partitionEndOffsets: { [key: number]: number } = {};
  partitions: number[];
  selectedPartitions: number[];
  visiblePartitions: number[];
  convertTopicMessagesJsonToGrid$: Subject<TopicMessages> = new Subject<TopicMessages>();
  selectedPartitionsChanged$: Subject<number[]> = new Subject<number[]>();
  visiblePartitionsChanged$: Subject<number[]> = new Subject<number[]>();

  constructor(private http: HttpClient,
              private progressBarService: ProgressBarService) {

  }

  getMessages(topicName: string) {
    let url;
    if (typeof this.selectedPartitions != 'undefined') {
      let partitionsParam = '';
      for (let i = 0; i < this.selectedPartitions.length; i++) {
        if (this.selectedPartitions[i] === 1) {
          partitionsParam += i + ','
        }
      }
      if (partitionsParam === '') {
        return;
      }
      url = `/api/topic/messages/${topicName}/${partitionsParam}/latest`;
    } else {
      url = `/api/topic/messages/${topicName}/all/latest`;
    }
    this.http.get(url).subscribe((data: TopicMessages) => {
      this.partitionOffsets = data.partitionOffsets;
      this.partitionEndOffsets = data.partitionEndOffsets;
      this.convertTopicMessagesJsonToGrid$.next(data);
      this.progressBarService.setProgress(false);
      this.partitions = Array.from({length: Object.values(this.partitionOffsets).length}, (v, i) => i);
      if (typeof this.selectedPartitions === 'undefined') {
        this.selectedPartitions = Array.from({length: Object.values(this.partitionOffsets).length}, () => 1);
        this.selectedPartitionsChanged$.next(this.selectedPartitions);
      }
      if (typeof this.visiblePartitions === 'undefined') {
        this.visiblePartitions = this.partitions.slice(0, this.VISIBLE_PARTITION_QUANTITY);
        this.visiblePartitionsChanged$.next(this.visiblePartitions);
      }
    })
  }

  togglePartition(nr: any, topicName: string) {
    const index = this.partitions.findIndex(e => e === nr);
    this.selectedPartitions[index] = -1 * this.selectedPartitions[index];
    this.progressBarService.setProgress(true);
    this.getMessages(topicName);
  }

  previous() {
    if (this.partitions.length > this.VISIBLE_PARTITION_QUANTITY) {
      const index = this.getFirstElementIndex();
      const subPartitions = this.partitions.slice(index - 1, index + (this.VISIBLE_PARTITION_QUANTITY - 1));
      this.updateVisiblePartitions(subPartitions);
    }
  }

  next() {
    const index = this.getFirstElementIndex();
    const subPartitions = this.partitions.slice(index + 1, index + (this.VISIBLE_PARTITION_QUANTITY + 1));
    this.updateVisiblePartitions(subPartitions);
  }

  private updateVisiblePartitions(subPartitions: number[]) {
    if (subPartitions.length === this.VISIBLE_PARTITION_QUANTITY) {
      this.visiblePartitions = subPartitions;
      this.visiblePartitionsChanged$.next(this.visiblePartitions);
    }
  }

  private getFirstElementIndex(): number {
    const firstElement = this.visiblePartitions[0];
    return this.partitions.findIndex(e => e === firstElement);;
  }

  hasNoMorePrevValues() {
    return this.visiblePartitions[0] === this.partitions[0];
  }

  hasNoMoreNextValues() {
    return this.visiblePartitions[this.visiblePartitions.length - 1] === this.partitions[this.partitions.length - 1];
  }


  getConvertTopicMessagesJsonToGridObservable(): Observable<TopicMessages> {
    return this.convertTopicMessagesJsonToGrid$.asObservable();
  }

  getPartitionOffset(partitionNr: number): string {
    return this.partitionOffsets[partitionNr] + ' - ' + this.partitionEndOffsets[partitionNr];
  }

  showMorePartitions(): boolean {
    return this.partitions?.length > this.VISIBLE_PARTITION_QUANTITY;
  }

  getSelectedPartitionsObservable(): Observable<number[]> {
    return this.selectedPartitionsChanged$.asObservable();
  }

  getVisiblePartitionsObservable(): Observable<number[]> {
    return this.visiblePartitionsChanged$.asObservable();
  }

}
