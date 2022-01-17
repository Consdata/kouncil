import {Component, Input} from '@angular/core';
import {ConsumerGroupOffset} from '../consumer-group/consumer-group';
import {CachedCellDataViewModel, CachedCellService} from './cached-cell.service';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';

@Component({
  selector: 'cached-cell',
  template: `
    <ng-container *ngIf="(vm$ | async) as vm">
      <div *ngIf="vm.realValue"
           title="{{vm.realValue}}">
        {{vm.realValue}}
      </div>
      <ng-container *ngIf="!vm.realValue">
        <div class="cached-value"
             title="{{vm.cache.value}}">
          {{vm.cache.value}}
        </div>
        <div *ngIf="!!showLastSeenTimestamp"
             class="last-seen"
             title="{{vm.cache.lastSeenTimestamp}}">
          Last seen: {{vm.cache.lastSeenTimestamp}}
        </div>
      </ng-container>
    </ng-container>
  `,
  styleUrls: ['./cached-cell.component.scss'],
  providers: [CachedCellService]
})
export class CachedCellComponent {

  vm$: Observable<CachedCellDataViewModel> = this.cachedCellService.vm$.pipe(
    tap((data) => console.log('subscribe', data))
  );

  @Input() public showLastSeenTimestamp: boolean = false;

  @Input()
  public set property(property: string) {
    this.cachedCellService.setProperty(property);
  };

  @Input()
  public set row(newRow: ConsumerGroupOffset) {
    this.cachedCellService.setRow(newRow);
  };

  constructor(private cachedCellService: CachedCellService) {
  }


}
