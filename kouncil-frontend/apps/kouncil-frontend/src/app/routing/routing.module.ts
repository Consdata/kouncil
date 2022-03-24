import {Injectable, NgModule} from '@angular/core';
import {TopicComponent} from '../topic/topic.component';
import {ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy, RouterModule, Routes} from '@angular/router';
import {TopicsComponent} from 'app/topics/topics.component';
import {BrokersComponent} from 'app/brokers/brokers.component';
import {ConsumerGroupsComponent} from 'app/consumers/consumer-groups/consumer-groups.component';
import {ConsumerGroupComponent} from 'app/consumers/consumer-group/consumer-group.component';
import {TrackComponent} from '../track/track.component';

@Injectable()
export class ReloadingRouterStrategy extends RouteReuseStrategy {
  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return false;
  }

  store(route: ActivatedRouteSnapshot, detachedTree: DetachedRouteHandle): void {
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    return false;
  }

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    return null;
  }

  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return false;
  }
}

const routes: Routes = [
  {
    path: 'brokers',
    component: BrokersComponent,
  },
  {
    path: 'topics',
    component: TopicsComponent,
  },
  {
    path: 'topics/messages/:topic',
    component: TopicComponent,
  },
  {
    path: 'consumer-groups',
    component: ConsumerGroupsComponent,
  },
  {
    path: 'consumer-groups/:groupId',
    component: ConsumerGroupComponent,
  },
  {
    path: 'track',
    component: TrackComponent,
  },
  {
    path: '',
    redirectTo: 'topics',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { useHash: true, relativeLinkResolution: 'legacy', onSameUrlNavigation: 'reload' })
  ],
  exports: [
    RouterModule
  ],
  declarations: [],
  providers: [{
    provide: RouteReuseStrategy,
    useClass: ReloadingRouterStrategy
  }]
})
export class RoutingModule {
}
