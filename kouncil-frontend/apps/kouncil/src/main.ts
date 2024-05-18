import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {environment} from './environments/environment';
import {AppModule} from './app/app.module';
import {APP_BASE_HREF} from '@angular/common';

if (environment.production) {
  enableProdMode();
}

fetch('/api/context-path')
.then(response => response.text())
.then(response => {
    platformBrowserDynamic([{provide: APP_BASE_HREF, useValue: response}])
    .bootstrapModule(AppModule)
    .catch((err) => console.error(err));
  }
);
