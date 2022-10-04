import {HttpClient} from '@angular/common/http';
import {Backend} from '@app/common-model';
import {environment} from '../environments/environment';
import {TopicsBackendService, TopicsDemoService, TopicsService} from '@app/feat-topics';
import {SendBackendService, SendDemoService, SendService} from '@app/feat-send';
import {ResendBackendService, ResendDemoService, ResendService} from '@app/resend-events';

export function topicsServiceFactory(http: HttpClient): TopicsService {
  switch (environment.backend) {
    case Backend.SERVER: {
      return new TopicsBackendService(http);
    }
    case Backend.DEMO:
    default:
      return new TopicsDemoService();
  }
}

export function sendServiceFactory(http: HttpClient): SendService {
  switch (environment.backend) {
    case Backend.SERVER: {
      return new SendBackendService(http);
    }
    case Backend.DEMO:
    default:
      return new SendDemoService();
  }
}

export function resendServiceFactory(http: HttpClient): ResendService {
  switch (environment.backend) {
    case Backend.SERVER: {
      return new ResendBackendService(http);
    }
    case Backend.DEMO:
    default:
      return new ResendDemoService();
  }
}
