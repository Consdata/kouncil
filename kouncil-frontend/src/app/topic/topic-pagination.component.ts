import {Component, Input} from '@angular/core';
import {TopicService} from './topic.service';
import {Page} from './page';

@Component({
  selector: 'topic-pagination',
  template: `
    <div class="kafka-topic-footer">
      <div class="kafka-topic-footer-pager-item">
      </div>
      <div class="kafka-topic-footer-pager-item pages">
        <datatable-pager
          *ngIf="onePartitionSelected"
          [pagerLeftArrowIcon]="'datatable-icon-left'"
          [pagerRightArrowIcon]="'datatable-icon-right'"
          [pagerPreviousIcon]="'datatable-icon-prev'"
          [pagerNextIcon]="'datatable-icon-skip'"
          [page]="paging.pageNumber"
          [size]="paging.size"
          [count]="paging.totalElements"
          (change)="paginateMessages($event)">
        </datatable-pager>
      </div>
      <div class="kafka-topic-footer-pager-item limit">
        <span class="limit-label">Items per page:</span>
        <mat-form-field class="select-form-field">
          <mat-select panelClass="select-limit-panel" class="select" [(value)]="paging.size" (selectionChange)="getMessages()">
            <mat-option *ngFor="let limit of pageLimits" [value]="limit">{{limit}}</mat-option>
          </mat-select>
        </mat-form-field>
      </div>
    </div>`,
  styleUrls: ['./topic-pagination.component.scss']
})

export class TopicPaginationComponent {
  @Input() paging: Page;
  @Input() onePartitionSelected: boolean;
  @Input() topicName: string;
  pageLimits = [10, 20, 50, 100];

  constructor(private topicService: TopicService) {
  }

  paginateMessages($event: any) {
    this.topicService.paginateMessages($event, this.topicName);
  }

  getMessages() {
    this.topicService.getMessages(this.topicName);
  }
}
