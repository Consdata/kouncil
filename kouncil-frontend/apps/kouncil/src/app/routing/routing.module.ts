import {inject, Injectable, NgModule} from '@angular/core';
import {TopicComponent} from '../topic/topic.component';
import {
  ActivatedRouteSnapshot,
  DetachedRouteHandle,
  RouteReuseStrategy,
  RouterModule,
  Routes
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
import {SystemFunctionName} from '@app/common-auth';
import {AccessDeniedComponent} from '../access-denied/access-denied.component';
import {PageNotFoundComponent} from '../page-not-found/page-not-found.component';
import {SchemasComponent} from '../schemas/list/schemas.component';
import {SchemaEditComponent} from '../schemas/form/edit/schema-edit.component';
import {SchemaCreateComponent} from '../schemas/form/create/schema-create.component';
import {SchemaDetailsComponent} from '../schemas/form/details/schema-details.component';
import {
  ClusterFormCreateComponent,
  ClusterFormEditComponent,
  ClusterFormViewComponent,
  ClustersComponent
} from '@app/feat-clusters';
import {UserGroupsComponent, UserGroupsFunctionsMatrixComponent} from '@app/feat-user-groups';
import {
  PoliciesComponent,
  PolicyFormCreateComponent,
  PolicyFormEditComponent,
  PolicyFormViewComponent
} from '@app/feat-data-masking';
import {PermissionsConfigResolver} from './permissions-config-resolver';

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
    path: '',
    component: MainComponent,
    canActivate: [(route: ActivatedRouteSnapshot) => inject(AuthGuard).canActivate(route)],
    resolve: {
      config: () => inject(ConfigResolver).resolve()
    },
    children: [
      {
        path: 'brokers',
        component: BrokersComponent,
        canActivate: [(route: ActivatedRouteSnapshot) => inject(AuthGuard).canActivate(route)],
        data: {
          roles: [SystemFunctionName.BROKERS_LIST]
        }
      },
      {
        path: 'topics',
        component: TopicsComponent,
        canActivate: [(route: ActivatedRouteSnapshot) => inject(AuthGuard).canActivate(route)],
        data: {
          roles: [SystemFunctionName.TOPIC_LIST]
        }
      },
      {
        path: 'topics/messages/:topic',
        component: TopicComponent,
        canActivate: [(route: ActivatedRouteSnapshot) => inject(AuthGuard).canActivate(route)],
        data: {
          roles: [SystemFunctionName.TOPIC_MESSAGES]
        }
      },
      {
        path: 'consumer-groups',
        component: ConsumerGroupsComponent,
        canActivate: [(route: ActivatedRouteSnapshot) => inject(AuthGuard).canActivate(route)],
        data: {
          roles: [SystemFunctionName.CONSUMER_GROUP_LIST]
        }
      },
      {
        path: 'consumer-groups/:groupId',
        component: ConsumerGroupComponent,
        canActivate: [(route: ActivatedRouteSnapshot) => inject(AuthGuard).canActivate(route)],
        data: {
          roles: [SystemFunctionName.CONSUMER_GROUP_DETAILS]
        }
      },
      {
        path: 'track',
        component: TrackComponent,
        canActivate: [(route: ActivatedRouteSnapshot) => inject(AuthGuard).canActivate(route)],
        data: {
          roles: [SystemFunctionName.TRACK_LIST]
        }
      },
      {
        path: 'access-denied',
        component: AccessDeniedComponent,
        canActivate: [AuthGuard],
        data: {
          hideClusterContext: true
        }
      },
      {
        path: 'schemas',
        component: SchemasComponent,
        canActivate: [(route: ActivatedRouteSnapshot) => inject(AuthGuard).canActivate(route)],
        data: {
          roles: [SystemFunctionName.SCHEMA_LIST]
        }
      },
      {
        path: 'schemas/edit/:subjectName/:version',
        component: SchemaEditComponent,
        canActivate: [(route: ActivatedRouteSnapshot) => inject(AuthGuard).canActivate(route)],
        data: {
          roles: [SystemFunctionName.SCHEMA_UPDATE]
        }
      },
      {
        path: 'schemas/create',
        component: SchemaCreateComponent,
        canActivate: [(route: ActivatedRouteSnapshot) => inject(AuthGuard).canActivate(route)],
        data: {
          roles: [SystemFunctionName.SCHEMA_CREATE]
        }
      },
      {
        path: 'schemas/:subjectName/:version',
        component: SchemaDetailsComponent,
        canActivate: [(route: ActivatedRouteSnapshot) => inject(AuthGuard).canActivate(route)],
        data: {
          roles: [SystemFunctionName.SCHEMA_DETAILS]
        }
      },
      {
        path: 'clusters',
        component: ClustersComponent,
        canActivate: [(route: ActivatedRouteSnapshot) => inject(AuthGuard).canActivate(route)],
        data: {
          roles: [SystemFunctionName.CLUSTER_LIST],
          hideClusterContext: true
        }
      },
      {
        path: 'clusters/cluster',
        component: ClusterFormCreateComponent,
        canActivate: [(route: ActivatedRouteSnapshot) => inject(AuthGuard).canActivate(route)],
        data: {
          roles: [SystemFunctionName.CLUSTER_CREATE],
          hideClusterContext: true
        }
      },
      {
        path: 'clusters/cluster/:clusterName',
        component: ClusterFormViewComponent,
        canActivate: [(route: ActivatedRouteSnapshot) => inject(AuthGuard).canActivate(route)],
        data: {
          roles: [SystemFunctionName.CLUSTER_DETAILS],
          hideClusterContext: true
        }
      },
      {
        path: 'clusters/cluster/:clusterName/edit',
        component: ClusterFormEditComponent,
        canActivate: [(route: ActivatedRouteSnapshot) => inject(AuthGuard).canActivate(route)],
        data: {
          roles: [SystemFunctionName.CLUSTER_UPDATE],
          hideClusterContext: true
        }
      },
      {
        path: 'user-groups',
        component: UserGroupsComponent,
        canActivate: [(route: ActivatedRouteSnapshot) => inject(AuthGuard).canActivate(route)],
        data: {
          roles: [SystemFunctionName.USER_GROUPS_LIST],
          hideClusterContext: true
        }
      },
      {
        path: 'user-groups-permissions',
        component: UserGroupsFunctionsMatrixComponent,
        canActivate: [(route: ActivatedRouteSnapshot) => inject(AuthGuard).canActivate(route)],
        data: {
          roles: [SystemFunctionName.USER_GROUPS],
          hideClusterContext: true
        }
      },
      {
        path: 'data-masking-policies',
        component: PoliciesComponent,
        canActivate: [AuthGuard],
        data: {
          roles: [SystemFunctionName.POLICY_LIST]
        }
      },
      {
        path: 'data-masking-policy',
        component: PolicyFormCreateComponent,
        canActivate: [AuthGuard],
        data: {
          roles: [SystemFunctionName.POLICY_CREATE]
        }
      },
      {
        path: 'data-masking-policy/:id/edit',
        component: PolicyFormEditComponent,
        canActivate: [AuthGuard],
        data: {
          roles: [SystemFunctionName.POLICY_UPDATE]
        }
      },
      {
        path: 'data-masking-policy/:id',
        component: PolicyFormViewComponent,
        canActivate: [AuthGuard],
        data: {
          roles: [SystemFunctionName.POLICY_DETAILS]
        }
      }
    ]
  },
  {
    path: '', component: MainLoginComponent,
    resolve: {
      config: PermissionsConfigResolver
    },
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
        component: PageNotFoundComponent,
        data: {
          hideClusterContext: true
        }
      }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      onSameUrlNavigation: 'reload'
    })
  ],
  exports: [RouterModule],
  declarations: [],
  providers: [
    {
      provide: RouteReuseStrategy,
      useClass: ReloadingRouterStrategy
    }
  ]
})
export class RoutingModule {
}
