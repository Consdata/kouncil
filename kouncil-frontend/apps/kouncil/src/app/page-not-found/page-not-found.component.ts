import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';

@Component({
  standalone: true,
  imports: [MatIconModule],
  selector: 'app-access-denied',
  template: `
    <div class="page-not-found-main">
      <mat-icon aria-hidden="false" class="material-symbols-outlined page-not-found-icon">
        not_listed_location
      </mat-icon>
      <span class="page-not-found-title">Page not found.</span>
      <span class="page-not-found-text">Sorry, we can't find that page.</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./page-not-found.component.scss']
})
export class PageNotFoundComponent {

}
