import {Component, EventEmitter, Input, Output} from '@angular/core';
import {TopicService} from './topic.service';
import {Page} from './page';
import {ServersService} from '@app/common-servers';

@Component({
  selector: 'app-topic-pagination',
  template: `
    <div class="kafka-topic-footer">
      <div class="kafka-topic-footer-pager-item">
      </div>
      <div class="kafka-topic-footer-pager-item pages">
        <datatable-pager
          [pagerLeftArrowIcon]="'datatable-icon-left'"
          [pagerRightArrowIcon]="'datatable-icon-right'"
          [pagerPreviousIcon]="'datatable-icon-prev'"
          [pagerNextIcon]="'datatable-icon-skip'"
          [page]="paging?.pageNumber"
          [size]="paging?.size"
          [count]="paging?.totalElements"
          (change)="paginateMessages($event)">
        </datatable-pager>

        <div class="page-no">
          <span class="page-no-label">Page no:</span>
          <mat-form-field class="page-no-form-field" [appearance]="'outline'">
            <input matInput class="page-no-input" type="number" [ngModel]="paging.pageNumber"
                   [ngModelOptions]="{updateOn: 'blur'}"
                   (ngModelChange)="paginateMessages({page: $event})">
          </mat-form-field>
        </div>
      </div>
      <div class="kafka-topic-footer-pager-item limit">
        <span class="limit-label">Items per partition:</span>
        <mat-form-field class="select-form-field" [appearance]="'outline'">
          <mat-select panelClass="select-limit-panel"
                      class="select"
                      [(value)]="paging.size"
                      [disableOptionCentering]="true"
                      (selectionChange)="getMessages()">
            <mat-option *ngFor="let limit of pageLimits" [value]="limit">{{limit}}</mat-option>
          </mat-select>
        </mat-form-field>
      </div>
    </div>`,
  styleUrls: ['./topic-pagination.component.scss']
})

export class TopicPaginationComponent {

  @Input() paging?: Page;
  @Input() topicName?: string;
  @Output() changeQueryParams: EventEmitter<number> = new EventEmitter<number>();
  pageLimits: number[] = [1, 5, 10, 20, 50, 100, 500, 1000];

  constructor(private topicService: TopicService, private servers: ServersService) {
  }

  paginateMessages($event: { page: number }): void {
    if (this.topicName) {
      this.changeQueryParams.emit($event.page);
      this.topicService.paginateMessages(this.servers.getSelectedServerId(), $event, this.topicName);
    }
  }

  getMessages(): void {
    if (this.topicName) {
      this.topicService.getMessages(this.servers.getSelectedServerId(), this.topicName);
    }
  }
}
