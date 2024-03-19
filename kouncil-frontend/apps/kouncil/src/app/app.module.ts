import {BrowserModule} from '@angular/platform-browser';
import {InjectionToken, NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';
import {
  HTTP_INTERCEPTORS,
  HttpClient,
  HttpClientModule,
  HttpClientXsrfModule
} from '@angular/common/http';
import {TopicComponent} from './topic/topic.component';
import {RoutingModule} from './routing/routing.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NavbarComponent} from './navbar/navbar.component';
import {BrokersComponent} from './brokers/brokers.component';
import {ConsumerGroupsComponent} from './consumers/consumer-groups/consumer-groups.component';
import {ConsumerGroupComponent} from './consumers/consumer-group/consumer-group.component';
import {ToolbarComponent} from './topic/toolbar/toolbar.component';
import {ClipboardModule} from '@angular/cdk/clipboard';
import {NgxJsonViewerModule} from 'ngx-json-viewer';
import {TopicPartitionsComponent} from './topic/topic-partitions.component';
import {TopicPaginationComponent} from './topic/topic-pagination.component';
import {
  ConsumerGroupsService,
  consumerGroupsServiceFactory
} from './consumers/consumer-groups/consumer-groups.service';
import {
  ConsumerGroupService,
  consumerGroupServiceFactory
} from './consumers/consumer-group/consumer-group.service';
import {topicServiceProvider} from './topic/topic.service';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {MatDividerModule} from '@angular/material/divider';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {BreadcrumbComponent} from './breadcrumb/breadcrumb.component';
import {MatDialogModule} from '@angular/material/dialog';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {BrokerComponent} from './broker/broker.component';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatSelectModule} from '@angular/material/select';
import {MessageViewComponent} from './topic/message/message-view.component';
import {FileSizePipe} from './brokers/filze-size.pipe';
import {MatTooltipModule} from '@angular/material/tooltip';
import {environment} from '../environments/environment';
import {TrackComponent} from './track/track.component';
import {TrackFilterComponent} from './track/track-filter/track-filter.component';
import {TrackResultComponent} from './track/track-result/track-result.component';
import {TrackService} from './track/track.service';
import {TrackBackendService} from './track/track.backend.service';
import {TrackDemoService} from './track/track.demo.service';
import {RX_STOMP_CONFIG} from './rx-stomp.config';
import {DemoComponent} from './demo/demo.component';
import {CachedCellComponent} from './consumers/cached-cell/cached-cell.component';
import {BrokerService, brokerServiceFactory} from './brokers/broker.service';
import {SchemaRegistryService, SchemaStateService} from '@app/schema-registry';
import {ResendModule, ResendService} from '@app/resend-events';
import {Backend} from '@app/common-model';
import {ConfirmModule} from '@app/feat-confirm';
import {CommonUtilsModule, HttpClientInterceptor, SearchService} from '@app/common-utils';
import {FeatTopicsModule, TopicService, TopicsService} from '@app/feat-topics';
import {
  resendServiceFactory,
  sendServiceFactory,
  surveyServiceFactory,
  topicServiceFactory,
  topicsServiceFactory
} from './app-factories';
import {FeatNoDataModule} from '@app/feat-no-data';
import {ServersBackendService, ServersDemoService, ServersService} from '@app/common-servers';
import {FeatSendModule, SendService} from '@app/feat-send';
import {RxStompConfig} from '@stomp/rx-stomp';
import {RxStompService} from './rx-stomp.service';
import {rxStompServiceFactory} from './rx-stomp-service-factory';
import {LoginComponent} from './login/login.component';
import {MainComponent} from './main/main.component';
import {CommonLoginModule} from '@app/common-login';
import {OAuthRedirectComponent} from './oauth/o-auth-redirect.component';
import {ChangePasswordComponent} from './login/change-password.component';
import {MainLoginComponent} from './login/main-login.component';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {CommonComponentsModule} from '@app/common-components';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {MatSortModule} from '@angular/material/sort';
import {AccessDeniedComponent} from './access-denied/access-denied.component';
import {PageNotFoundComponent} from './page-not-found/page-not-found.component';
import {SurveyComponent} from './survey/survey.component';
import {
  SurveyScaleQuestionComponent
} from './survey/survey-scale-question/survey-scale-question.component';
import {SurveyService} from './survey/survey.service';
import {AuthBackendService, AuthDemoService, AuthService, CommonAuthModule} from '@app/common-auth';

export const BASE_URL = new InjectionToken('BASE_URL');

export function configProviderFactory(provider: ServersService): Promise<boolean> {
  return provider.load();
}

export function serverServiceFactory(http: HttpClient,
                                     schemaRegistryService: SchemaRegistryService,
                                     schemaStateService: SchemaStateService): ServersService {
  switch (environment.backend) {
    case Backend.SERVER: {
      return new ServersBackendService(http, schemaRegistryService, schemaStateService);
    }
    case Backend.DEMO:
    default:
      return new ServersDemoService();
  }
}

export function trackServiceFactory(http: HttpClient, rxStompService: RxStompService): TrackService {
  switch (environment.backend) {
    case Backend.SERVER: {
      return new TrackBackendService(http, rxStompService);
    }
    case Backend.DEMO:
    default:
      return new TrackDemoService(rxStompService);
  }
}

export function authServiceFactory(http: HttpClient, baseUrl: string): AuthService {
  switch (environment.backend) {
    case Backend.SERVER: {
      return new AuthBackendService(http, baseUrl);
    }
    case Backend.DEMO:
    default:
      return new AuthDemoService();
  }
}

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    TopicComponent,
    ConsumerGroupsComponent,
    ToolbarComponent,
    BrokersComponent,
    ConsumerGroupComponent,
    TopicPartitionsComponent,
    TopicPaginationComponent,
    BreadcrumbComponent,
    BrokerComponent,
    MessageViewComponent,
    FileSizePipe,
    TrackComponent,
    TrackFilterComponent,
    TrackResultComponent,
    DemoComponent,
    CachedCellComponent,
    LoginComponent,
    MainComponent,
    ChangePasswordComponent,
    MainLoginComponent,
    OAuthRedirectComponent,
    AccessDeniedComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RoutingModule,
    FormsModule,
    NgxDatatableModule,
    ClipboardModule,
    NgxJsonViewerModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatSnackBarModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatTooltipModule,
    CommonUtilsModule,
    ResendModule,
    ConfirmModule,
    FeatTopicsModule,
    FeatNoDataModule,
    FeatSendModule,
    CommonLoginModule,
    HttpClientXsrfModule,
    MatAutocompleteModule,
    CommonComponentsModule,
    MatSortModule,
    DragDropModule,
    PageNotFoundComponent,
    SurveyComponent,
    SurveyScaleQuestionComponent,
    CommonAuthModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpClientInterceptor,
      multi: true
    },
    SearchService,
    topicServiceProvider,
    {
      provide: BrokerService,
      useFactory: brokerServiceFactory,
      deps: [HttpClient]
    },
    {
      provide: ConsumerGroupsService,
      useFactory: consumerGroupsServiceFactory,
      deps: [HttpClient]
    },
    {
      provide: ConsumerGroupService,
      useFactory: consumerGroupServiceFactory,
      deps: [HttpClient]
    },
    {
      provide: TopicsService,
      useFactory: topicsServiceFactory,
      deps: [HttpClient]
    },
    {
      provide: TopicService,
      useFactory: topicServiceFactory,
      deps: [HttpClient]
    },
    {
      provide: SendService,
      useFactory: sendServiceFactory,
      deps: [HttpClient]
    },
    {
      provide: ResendService,
      useFactory: resendServiceFactory,
      deps: [HttpClient]
    },
    {
      provide: ServersService,
      useFactory: serverServiceFactory,
      deps: [HttpClient, SchemaRegistryService, SchemaStateService]
    },
    {
      provide: TrackService,
      useFactory: trackServiceFactory,
      deps: [HttpClient, RxStompService]
    },
    {
      provide: RxStompConfig,
      useValue: RX_STOMP_CONFIG,
    },
    {
      provide: RxStompService,
      useFactory: rxStompServiceFactory,
      deps: [RxStompConfig],
    },
    {
      provide: AuthService,
      useFactory: authServiceFactory,
      deps: [HttpClient, BASE_URL]
    },
    {
      provide: SurveyService,
      useFactory: surveyServiceFactory,
      deps: [HttpClient]
    },
    {
      provide: BASE_URL,
      useValue: environment.baseUrl
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
