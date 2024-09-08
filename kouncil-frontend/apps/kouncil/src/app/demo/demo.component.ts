import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'app-demo',
  template: `
    <div>
      This is a demo version of Kouncil. Get the full version at&nbsp;<a href="https://kouncil.io" target="_blank">kouncil.io</a>
      <mat-icon class="material-symbols-outlined" aria-hidden="false">open_in_new</mat-icon>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./demo.component.scss']
})
export class DemoComponent {
}
