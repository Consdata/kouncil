import { NgModule } from '@angular/core';
import { TopicComponent } from "../topic/topic.component";
import { RouterModule, Routes } from "@angular/router";
import { TopicsComponent } from "app/topics/topics.component";
import { BrokersComponent } from "app/brokers/brokers.component";
import { ConsumerGroupsComponent } from "app/consumers/consumer-groups/consumer-groups.component";
import { ConsumerGroupComponent } from "app/consumers/consumer-group/consumer-group.component";

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
    path: '',
    redirectTo: 'topics',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { useHash: true, relativeLinkResolution: 'legacy' })
  ],
  exports: [
    RouterModule
  ],
  declarations: []
})
export class RoutingModule {
}
