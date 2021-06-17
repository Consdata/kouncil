import {BrowserModule} from '@angular/platform-browser';
import {APP_INITIALIZER, NgModule} from '@angular/core';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';

import {AppComponent} from './app.component';
import {HTTP_INTERCEPTORS, HttpClient, HttpClientModule} from '@angular/common/http';
import {TopicComponent} from './topic/topic.component';
import {RoutingModule} from './routing/routing.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TopicsComponent} from './topics/topics.component';
import {SendComponent} from './send/send.component';
import {NavbarComponent} from './navbar/navbar.component';
import {SearchService} from 'app/search.service';
import {BrokersComponent} from './brokers/brokers.component';
import {AutosizeDirective} from 'app/util/autosize.directive';
import {ConsumerGroupsComponent} from 'app/consumers/consumer-groups/consumer-groups.component';
import {ConsumerGroupComponent} from 'app/consumers/consumer-group/consumer-group.component';
import {ToolbarComponent} from 'app/topic/toolbar/toolbar.component';
import {ClipboardModule} from '@angular/cdk/clipboard';
import {NgxJsonViewerModule} from 'ngx-json-viewer';
import {ProgressBarComponent} from './util/progress-bar.component';
import {NoDataPlaceholderComponent} from './no-data-placeholder/no-data-placeholder.component';
import {TopicPartitionsComponent} from './topic/topic-partitions.component';
import {TopicPaginationComponent} from './topic/topic-pagination.component';
import {BrokerService, brokerServiceFactory} from './brokers/broker.service';
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
import {Servers} from './servers.service';
import {HttpClientInterceptor} from './util/http-client.interceptor';
import {MatTooltipModule} from '@angular/material/tooltip';

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
    AutosizeDirective,
    ConsumerGroupComponent,
    ProgressBarComponent,
    NoDataPlaceholderComponent,
    TopicPartitionsComponent,
    NoDataPlaceholderComponent,
    TopicPaginationComponent,
    BreadcrumbComponent,
    ConfirmComponent,
    BrokerComponent,
    MessageViewComponent
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
        MatTooltipModule
    ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpClientInterceptor,
      multi: true
    },
    Servers,
    {
      provide: APP_INITIALIZER,
      useFactory: configProviderFactory,
      deps: [Servers],
      multi: true
    },
    SearchService,
    topicServiceProvider,
    {
      provide: BrokerService,
      useFactory: brokerServiceFactory,
      deps: [HttpClient]
    }, {
      provide: ConsumerGroupsService,
      useFactory: consumerGroupsServiceFactory,
      deps: [HttpClient]
    }, {
      provide: ConsumerGroupService,
      useFactory: consumerGroupServiceFactory,
      deps: [HttpClient]
    }, {
      provide: TopicsService,
      useFactory: topicsServiceFactory,
      deps: [HttpClient]
    }, {
      provide: SendService,
      useFactory: sendServiceFactory,
      deps: [HttpClient]
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}

export function configProviderFactory(provider: Servers) {
  return () => provider.load();
}
