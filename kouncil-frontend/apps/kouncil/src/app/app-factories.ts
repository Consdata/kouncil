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
import {
  ClusterBackendService,
  ClusterDemoService,
  ClustersBackendService,
  ClustersDemoService,
  ClusterService,
  ClustersService
} from '@app/feat-clusters';
import {
  FunctionsBackendService,
  FunctionsDemoService,
  FunctionsService,
  UserGroupBackendService,
  UserGroupDemoService,
  UserGroupsBackendService,
  UserGroupsDemoService,
  UserGroupService,
  UserGroupsService
} from '@app/feat-user-groups';
import {
  FirstTimeAppLaunchBackendService,
  FirstTimeAppLaunchDemoService,
  FirstTimeAppLaunchService
} from '@app/feat-first-time-app-launch';
import {ConfirmService} from '@app/feat-confirm';
import {AuthService} from '@app/common-auth';
import {Router} from '@angular/router';

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

export function clustersServiceFactory(http: HttpClient): ClustersService {
  switch (environment.backend) {
    case Backend.SERVER: {
      return new ClustersBackendService(http);
    }
    case Backend.DEMO:
    default:
      return new ClustersDemoService();
  }
}

export function clusterServiceFactory(http: HttpClient): ClusterService {
  switch (environment.backend) {
    case Backend.SERVER: {
      return new ClusterBackendService(http);
    }
    case Backend.DEMO:
    default:
      return new ClusterDemoService();
  }
}

export function userGroupsServiceFactory(http: HttpClient): UserGroupsService {
  switch (environment.backend) {
    case Backend.SERVER: {
      return new UserGroupsBackendService(http);
    }
    case Backend.DEMO:
    default:
      return new UserGroupsDemoService();
  }
}

export function functionsServiceFactory(http: HttpClient): FunctionsService {
  switch (environment.backend) {
    case Backend.SERVER: {
      return new FunctionsBackendService(http);
    }
    case Backend.DEMO:
    default:
      return new FunctionsDemoService();
  }
}

export function userGroupServiceFactory(http: HttpClient): UserGroupService {
  switch (environment.backend) {
    case Backend.SERVER: {
      return new UserGroupBackendService(http);
    }
    case Backend.DEMO:
    default:
      return new UserGroupDemoService();
  }
}

export function firstTimeAppLaunchServiceFactory(http: HttpClient, confirmService: ConfirmService,
                                                 auth: AuthService, router: Router): FirstTimeAppLaunchService {
  switch (environment.backend) {
    case Backend.SERVER: {
      return new FirstTimeAppLaunchBackendService(http, confirmService, auth, router);
    }
    case Backend.DEMO:
    default:
      return new FirstTimeAppLaunchDemoService();
  }
}
