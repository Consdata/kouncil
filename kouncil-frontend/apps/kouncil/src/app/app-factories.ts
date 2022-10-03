import {HttpClient} from '@angular/common/http';
import {Backend} from '@app/common-model';
import {environment} from '../environments/environment';
import {TopicsBackendService, TopicsDemoService, TopicsService} from '@app/feat-topics';

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
