import {BrowserModule} from '@angular/platform-browser';
import {APP_INITIALIZER, NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';
import {HTTP_INTERCEPTORS, HttpClient, HttpClientModule} from '@angular/common/http';
import {TopicComponent} from './topic/topic.component';
import {RoutingModule} from './routing/routing.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TopicsComponent} from './topics/topics.component';
import {SendComponent} from './send/send.component';
import {NavbarComponent} from './navbar/navbar.component';
import {BrokersComponent} from './brokers/brokers.component';
import {ConsumerGroupsComponent} from './consumers/consumer-groups/consumer-groups.component';
import {ConsumerGroupComponent} from './consumers/consumer-group/consumer-group.component';
import {ToolbarComponent} from './topic/toolbar/toolbar.component';
import {ClipboardModule} from '@angular/cdk/clipboard';
import {NgxJsonViewerModule} from 'ngx-json-viewer';
import {ProgressBarComponent} from './util/progress-bar.component';
import {NoDataPlaceholderComponent} from './no-data-placeholder/no-data-placeholder.component';
import {TopicPartitionsComponent} from './topic/topic-partitions.component';
import {TopicPaginationComponent} from './topic/topic-pagination.component';
import {ConsumerGroupsService, consumerGroupsServiceFactory} from './consumers/consumer-groups/consumer-groups.service';
import {ConsumerGroupService, consumerGroupServiceFactory} from './consumers/consumer-group/consumer-group.service';
import {TopicsService, topicsServiceFactory} from './topics/topics.service';
import {topicServiceProvider} from './topic/topic.service';
import {SendService, sendServiceFactory} from './send/send.service';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {MatDividerModule} from '@angular/material/divider';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {BreadcrumbComponent} from './breadcrumb/breadcrumb.component';
import {MatDialogModule} from '@angular/material/dialog';
import {ConfirmComponent} from './confirm/confirm.component';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {BrokerComponent} from './broker/broker.component';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatSelectModule} from '@angular/material/select';
import {MessageViewComponent} from './topic/message/message-view.component';
import {FileSizePipe} from './brokers/filze-size.pipe';
import {HttpClientInterceptor} from './util/http-client.interceptor';
import {MatTooltipModule} from '@angular/material/tooltip';
import {ServersService} from './servers.service';
import {environment} from '../environments/environment';
import {Backend} from './app.backend';
import {ServersBackendService} from './servers.backend.service';
import {ServersDemoService} from './servers.demo.service';
import {TrackComponent} from './track/track.component';
import {TrackFilterComponent} from './track/track-filter/track-filter.component';
import {TrackResultComponent} from './track/track-result/track-result.component';
import {TrackService} from './track/track.service';
import {TrackBackendService} from './track/track.backend.service';
import {TrackDemoService} from './track/track.demo.service';
import {NgxMatSelectSearchModule} from 'ngx-mat-select-search';
import {InjectableRxStompConfig, RxStompService, rxStompServiceFactory} from '@stomp/ng2-stompjs';
import {RX_STOMP_CONFIG} from './rx-stomp.config';
import {DemoComponent} from './demo/demo.component';
import {CachedCellComponent} from './consumers/cached-cell/cached-cell.component';
import {BrokerService, brokerServiceFactory} from './brokers/broker.service';
import {SearchService} from './search.service';
import {SchemaRegistryService, SchemaStateService} from '@app/schema-registry';
import {ResendModule, ResendService, resendServiceFactory} from '@app/resend-events';


export function configProviderFactory(provider: ServersService): () => Promise<boolean> {
  return () => provider.load();
}

export function serverServiceFactory(http: HttpClient,
                                     schemaRegistryService: SchemaRegistryService,
                                     schemaStateService: SchemaStateService): ServersService {
  switch (environment.backend) {
    case Backend.SERVER: {
      return new ServersBackendService(http, schemaRegistryService, schemaStateService);
    }
    case Backend.DEMO: {
      return new ServersDemoService();
    }
  }
}

export function trackServiceFactory(http: HttpClient, rxStompService: RxStompService): TrackService {
  switch (environment.backend) {
    case Backend.SERVER: {
      return new TrackBackendService(http, rxStompService);
    }
    case Backend.DEMO: {
      return new TrackDemoService(rxStompService);
    }
  }
}

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    TopicComponent,
    TopicsComponent,
    ConsumerGroupsComponent,
    SendComponent,
    ToolbarComponent,
    BrokersComponent,
    ConsumerGroupComponent,
    ProgressBarComponent,
    NoDataPlaceholderComponent,
    TopicPartitionsComponent,
    NoDataPlaceholderComponent,
    TopicPaginationComponent,
    BreadcrumbComponent,
    ConfirmComponent,
    BrokerComponent,
    MessageViewComponent,
    FileSizePipe,
    TrackComponent,
    TrackFilterComponent,
    TrackResultComponent,
    DemoComponent,
    CachedCellComponent,
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
    NgxMatSelectSearchModule,
    MatTooltipModule,
    ResendModule
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
      provide: APP_INITIALIZER,
      useFactory: configProviderFactory,
      deps: [ServersService],
      multi: true
    },
    {
      provide: InjectableRxStompConfig,
      useValue: RX_STOMP_CONFIG,
    },
    {
      provide: RxStompService,
      useFactory: rxStompServiceFactory,
      deps: [InjectableRxStompConfig],
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
