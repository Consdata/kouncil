import {Component} from '@angular/core';
import {MonacoEditorService} from '@app/common-components';

@Component({
  selector: 'app-root',
  template: `
    <router-outlet></router-outlet>
  `,
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {

  constructor(private monacoEditorService: MonacoEditorService) {
    monacoEditorService.load();
  }
}
