import {Component, Input} from '@angular/core';
import {TopicService} from './topic.service';

@Component({
  selector: 'topic-partitions',
  template: `
    <div class="kafka-topic-partitions-wrapper">
      <div class="kafka-topic-partitions">
        Choose partition:
        <span *ngIf="showMorePartitions()" class="kafka-badge-secondary"
              [ngClass]="{'kafka-badge-secondary-disabled': hasNoMorePrevValues()}" (click)="previous()">&#60;</span>
        <span *ngFor="let i of visiblePartitions">
              <span [ngClass]="(selectedPartitions[i] === 1)?'kafka-badge-primary':'kafka-badge-secondary'"
                    class="partition"
                    (click)="togglePartition(i)"
                    [title]="getPartitionOffset(i)">{{i}}</span>
                </span>
        <span *ngIf="showMorePartitions()" class="kafka-badge-secondary"
              [ngClass]="{'kafka-badge-secondary-disabled': hasNoMoreNextValues()}"
              (click)="next()">&#62;</span>
      </div>
    </div>`,
  styleUrls: ['./topic-partitions.component.scss']
})

export class TopicPartitionsComponent {
  @Input() topicName: string;
  selectedPartitions: number[];
  visiblePartitions: number[];

  constructor(private topicService: TopicService) {
    this.topicService.getSelectedPartitionsObservable().subscribe(value => {
      this.selectedPartitions = value;
    });

    this.topicService.getVisiblePartitionsObservable().subscribe(value => {
      this.visiblePartitions = value;
    });
  }

  hasNoMorePrevValues(): boolean {
    return this.topicService.hasNoMorePrevValues();
  }

  hasNoMoreNextValues(): boolean {
    return this.topicService.hasNoMoreNextValues();
  }

  previous(): void {
    this.topicService.previous();
  }

  next(): void {
    this.topicService.next();
  }

  togglePartition(nr: number): void {
    this.topicService.togglePartition(nr, this.topicName);
  }

  getPartitionOffset(partitionNr: number): string {
    return this.topicService.getPartitionOffset(partitionNr);
  }

 showMorePartitions(): boolean {
    return this.topicService.showMorePartitions();
 }

}
