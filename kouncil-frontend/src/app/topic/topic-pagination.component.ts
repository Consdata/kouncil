import {Component, Input} from '@angular/core';
import {TopicService} from './topic.service';
import {Page} from './page';
import {Globals} from '../globals';

@Component({
  selector: 'topic-pagination',
  template: `
    <div class="kafka-topic-footer">
      <div class="kafka-topic-footer-pager">
        <div class="kafka-topic-footer-pager-item">
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
        <div class="kafka-topic-footer-pager-item">
          <span>Items per page:</span>
          <select class="kafka-topic-footer-pager-select-limit" [(ngModel)]="paging.size"
                  (change)="getMessages()">
            <option *ngFor="let limit of pageLimits" [ngValue]="limit">{{limit}}</option>
          </select>
        </div>
      </div>
    </div>`,
  styleUrls: ['./topic-pagination.component.scss']
})

export class TopicPaginationComponent {
  @Input() paging: Page;
  @Input() onePartitionSelected: boolean;
  @Input() topicName: string;
  pageLimits = [10, 20, 50, 100];

  constructor(private topicService: TopicService, private globals: Globals) {
  }

  paginateMessages($event: any) {
    this.topicService.paginateMessages(this.globals.selectedServer.serverId, $event, this.topicName);
  }

  getMessages() {
    this.topicService.getMessages(this.globals.selectedServer.serverId, this.topicName);
  }
}
