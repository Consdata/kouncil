import {Component, Input} from '@angular/core';
import {TopicService} from './topic.service';
import {MatSelectChange} from '@angular/material/select';

@Component({
  selector: 'topic-partitions',
  template: `
    <mat-form-field>
      <mat-select class="select" [(value)]="selectedPartition" (selectionChange)="togglePartition($event)">
        <mat-option value="all">All partitions</mat-option>
        <mat-option *ngFor="let i of ['0','1','2','3']" value="{{i}}">{{i}}</mat-option>
      </mat-select>
    </mat-form-field>
  `,
  styleUrls: ['./topic-partitions.component.scss']
})
export class TopicPartitionsComponent {

  private ALL_PARTITIONS = 'all';

  @Input() topicName: string;

  selectedPartition = this.ALL_PARTITIONS;

  constructor(private topicService: TopicService) {
  }

  togglePartition(partition: MatSelectChange): void {
    const value = partition.value;
    this.selectedPartition = value;
    if (value === this.ALL_PARTITIONS) {
      this.topicService.selectAllPartitions(this.topicName);
    } else {
      this.topicService.selectPartition(parseInt(value, 10), this.topicName);
    }
  }

}
