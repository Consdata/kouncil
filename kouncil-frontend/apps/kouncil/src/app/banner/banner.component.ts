import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'app-banner',
  template: `
    <div>
      <ng-content></ng-content>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./banner.component.scss']
})
export class BannerComponent {
}
