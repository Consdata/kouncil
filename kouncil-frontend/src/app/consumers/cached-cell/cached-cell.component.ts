import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {ConsumerGroupOffset} from '../consumer-group/consumer-group';
import {CachedCellDataViewModel, CachedCellService} from './cached-cell.service';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-cached-cell',
  template: `
    <ng-container *ngIf="(vm$ | async) as vm">
      <div *ngIf="vm.realValue; else cacheTemplate"
           title="{{vm.realValue}}">
        {{vm.realValue}}
      </div>
      <ng-template #cacheTemplate>
        <div *ngIf="!vm.cache.value" class="cached-value">NO CACHED DATA</div>
        <ng-container *ngIf="vm.cache.value">
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
      </ng-template>
    </ng-container>
  `,
  styleUrls: ['./cached-cell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CachedCellService]
})
export class CachedCellComponent {

  vm$: Observable<CachedCellDataViewModel> = this.cachedCellService.vm$;

  @Input() public showLastSeenTimestamp: boolean = false;

  @Input()
  public set property(property: string) {
    this.cachedCellService.setProperty(property);
  }

  @Input()
  public set row(newRow: ConsumerGroupOffset) {
    this.cachedCellService.setRow(newRow);
  }

  constructor(private cachedCellService: CachedCellService) {
  }

}
