import { NgModule } from '@angular/core';
import { TopicComponent } from "../topic/topic.component";
import { RouterModule, Routes } from "@angular/router";
import { TopicsComponent } from "app/topics/topics.component";
import { SendComponent } from "app/send/send.component";
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
    path: 'consumer-groups',
    component: ConsumerGroupsComponent,
  },
  {
    path: 'consumer-group/:groupId',
    component: ConsumerGroupComponent,
  },
  {
    path: 'topic/messages/:topic',
    component: TopicComponent,
  },
  {
    path: 'topic/send',
    component: SendComponent,
  },
  {
    path: '',
    component: TopicsComponent,
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
