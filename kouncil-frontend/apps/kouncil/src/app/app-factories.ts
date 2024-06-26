import {HttpClient} from '@angular/common/http';
import {Backend} from '@app/common-model';
import {environment} from '../environments/environment';
import {TopicsBackendService, TopicsDemoService, TopicsService} from '@app/feat-topics';
import {TopicBackendService, TopicDemoService, TopicService} from '@app/feat-topic-form';
import {SendBackendService, SendDemoService, SendService} from '@app/feat-send';
import {ResendBackendService, ResendDemoService, ResendService} from '@app/resend-events';
import {SurveyBackendService} from './survey/survey.backend.service';
import {SurveyService} from './survey/survey.service';
import {SurveyDemoService} from './survey/survey.demo.service';
import {
  SchemaRegistryBackendService,
  SchemaRegistryDemoService,
  SchemaRegistryService
} from '@app/schema-registry';

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

export function topicServiceFactory(http: HttpClient): TopicService {
  switch (environment.backend) {
    case Backend.SERVER: {
      return new TopicBackendService(http);
    }
    case Backend.DEMO:
    default:
      return new TopicDemoService();
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

export function surveyServiceFactory(http: HttpClient): SurveyService {
  switch (environment.backend) {
    case Backend.SERVER: {
      return new SurveyBackendService(http);
    }
    case Backend.DEMO:
    default:
      return new SurveyDemoService();
  }
}

export function schemaRegistryServiceFactory(http: HttpClient): SchemaRegistryService {
  switch (environment.backend) {
    case Backend.SERVER: {
      return new SchemaRegistryBackendService(http);
    }
    case Backend.DEMO:
    default:
      return new SchemaRegistryDemoService();
  }
}
