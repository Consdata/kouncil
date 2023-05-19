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
import {KouncilRole} from '../login/kouncil-role';
import {AccessDeniedComponent} from '../access-denied/access-denied.component';
import {PageNotFoundComponent} from '../page-not-found/page-not-found.component';

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
        canActivate: [AuthGuard],
        data: {
          roles: [KouncilRole.KOUNCIL_ADMIN]
        }
      },
      {
        path: 'topics',
        component: TopicsComponent,
        canActivate: [AuthGuard],
        data: {
          roles: [KouncilRole.KOUNCIL_EDITOR, KouncilRole.KOUNCIL_VIEWER]
        }
      },
      {
        path: 'topics/messages/:topic',
        component: TopicComponent,
        canActivate: [AuthGuard],
        data: {
          roles: [KouncilRole.KOUNCIL_EDITOR, KouncilRole.KOUNCIL_VIEWER]
        }
      },
      {
        path: 'consumer-groups',
        component: ConsumerGroupsComponent,
        canActivate: [AuthGuard],
        data: {
          roles: [KouncilRole.KOUNCIL_ADMIN]
        }
      },
      {
        path: 'consumer-groups/:groupId',
        component: ConsumerGroupComponent,
        canActivate: [AuthGuard],
        data: {
          roles: [KouncilRole.KOUNCIL_ADMIN]
        }
      },
      {
        path: 'track',
        component: TrackComponent,
        canActivate: [AuthGuard],
        data: {
          roles: [KouncilRole.KOUNCIL_EDITOR, KouncilRole.KOUNCIL_VIEWER]
        }
      },
      {
        path: 'access-denied',
        component: AccessDeniedComponent
      }
    ]
  },
  {
    path: '', component: MainLoginComponent,
    children: [
      {path: 'login', component: LoginComponent},
      {path: 'changePassword', component: ChangePasswordComponent, canActivate: [AuthGuard]}
    ]
  },
  {path: 'oauth', component: OAuthRedirectComponent},
  {
    path: '', component: MainComponent,
    children: [
      {
        path: '**',
        pathMatch: 'full',
        component: PageNotFoundComponent
      }
    ]
  }
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
