import {Injectable, NgModule} from '@angular/core';
import {TopicComponent} from '../topic/topic.component';
import {
  ActivatedRouteSnapshot,
  DetachedRouteHandle,
  RouteReuseStrategy,
  RouterModule,
  Routes,
} from '@angular/router';
import {TrackComponent} from '../track/track.component';
import {BrokersComponent} from '../brokers/brokers.component';
import {ConsumerGroupsComponent} from '../consumers/consumer-groups/consumer-groups.component';
import {ConsumerGroupComponent} from '../consumers/consumer-group/consumer-group.component';
import {TopicsComponent} from '@app/feat-topics';
import {LoginComponent} from '../login/login.component';
import {AuthGuard} from './auth.guard';
import {MainComponent} from '../main/main.component';
import {ConfigResolver} from './config-resolver';
import {ChangePasswordComponent} from '../login/change-password.component';
import {MainLoginComponent} from '../login/main-login.component';
import {OAuthRedirectComponent} from '../oauth/o-auth-redirect.component';
import {SchemasComponent} from "@app/schema-registry";

@Injectable()
export class ReloadingRouterStrategy extends RouteReuseStrategy {
  shouldDetach(_route: ActivatedRouteSnapshot): boolean {
    return false;
  }

  store(
    _route: ActivatedRouteSnapshot,
    _detachedTree: DetachedRouteHandle
  ): void {
    // empty
  }

  shouldAttach(_route: ActivatedRouteSnapshot): boolean {
    return false;
  }

  retrieve(_route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    return null;
  }

  shouldReuseRoute(
    _future: ActivatedRouteSnapshot,
    _curr: ActivatedRouteSnapshot
  ): boolean {
    return false;
  }
}

const routes: Routes = [
  {
    path: '', component: MainComponent, canActivate: [AuthGuard],
    resolve: {
      config: ConfigResolver
    },
    children: [
      {
        path: 'brokers',
        component: BrokersComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'topics',
        component: TopicsComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'topics/messages/:topic',
        component: TopicComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'consumer-groups',
        component: ConsumerGroupsComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'consumer-groups/:groupId',
        component: ConsumerGroupComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'track',
        component: TrackComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'schemas',
        component: SchemasComponent,
        canActivate: [AuthGuard]
      }
    ]
  },
  {
    path: '', component: MainLoginComponent,
    children: [
      {path: 'login', component: LoginComponent},
      {path: 'changePassword', component: ChangePasswordComponent, canActivate: [AuthGuard]},
    ]
  },
  {path: 'oauth', component: OAuthRedirectComponent}
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      onSameUrlNavigation: 'reload'
    }),
  ],
  exports: [RouterModule],
  declarations: [],
  providers: [
    {
      provide: RouteReuseStrategy,
      useClass: ReloadingRouterStrategy,
    },
  ],
})
export class RoutingModule {
}
