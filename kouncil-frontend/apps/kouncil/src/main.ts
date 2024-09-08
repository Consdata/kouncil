import {enableProdMode, StaticProvider} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {environment} from './environments/environment';
import {AppModule} from './app/app.module';
import {APP_BASE_HREF} from '@angular/common';
import {Backend} from '@app/common-model';

function bootstrap(extraProviders?: StaticProvider[] | undefined) {
  platformBrowserDynamic(extraProviders)
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
}

if (environment.production) {
  enableProdMode();
}

if (Backend.SERVER === environment.backend) {
  fetch('/api/context-path')
  .then(response => response.text())
  .then(response => {
      bootstrap([{provide: APP_BASE_HREF, useValue: response}]);
    }
  );
} else {
  bootstrap();
}
