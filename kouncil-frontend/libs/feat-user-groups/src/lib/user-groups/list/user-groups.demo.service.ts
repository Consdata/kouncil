import {Injectable} from '@angular/core';
import {UserGroupsService} from './user-groups.service';
import {Observable, of} from 'rxjs';
import {FunctionGroup, UserGroup} from '../../user-groups-functions-matrix/user-groups.model';
import {SystemFunctionName} from '@app/common-auth';

@Injectable({
  providedIn: 'root',
})
export class UserGroupsDemoService implements UserGroupsService {

  getUserGroups$(): Observable<Array<UserGroup>> {
    return of([
      {id: 1, code: 'admin_group', name: 'Admin group', functions: [
          {
            id: 8,
            name: SystemFunctionName.CONSUMER_GROUP_LIST,
            label: 'View consumer group list',
            functionGroup: FunctionGroup.CONSUMER_GROUP
          },
          {
            id: 9,
            name: SystemFunctionName.CONSUMER_GROUP_DELETE,
            label: 'Delete consumer group',
            functionGroup: FunctionGroup.CONSUMER_GROUP
          },
          {
            id: 10,
            name: SystemFunctionName.CONSUMER_GROUP_DETAILS,
            label: 'View consumer group details',
            functionGroup: FunctionGroup.CONSUMER_GROUP
          },
          {
            id: 17,
            name: SystemFunctionName.CLUSTER_LIST,
            label: 'Cluster list',
            functionGroup: FunctionGroup.CLUSTER
          },
          {
            id: 18,
            name: SystemFunctionName.CLUSTER_CREATE,
            label: 'Create new cluster',
            functionGroup: FunctionGroup.CLUSTER
          },
          {
            id: 19,
            name: SystemFunctionName.CLUSTER_UPDATE,
            label: 'Update cluster',
            functionGroup: FunctionGroup.CLUSTER
          },
          {
            id: 20,
            name: SystemFunctionName.CLUSTER_DETAILS,
            label: 'View cluster details',
            functionGroup: FunctionGroup.CLUSTER
          },
          {
            id: 21,
            name: SystemFunctionName.CLUSTER_DELETE,
            label: 'Delete cluster',
            functionGroup: FunctionGroup.CLUSTER
          },
          {
            id: 22,
            name: SystemFunctionName.BROKERS_LIST,
            label: 'View broker list',
            functionGroup: FunctionGroup.CLUSTER
          },
          {
            id: 23,
            name: SystemFunctionName.BROKER_DETAILS,
            label: 'View broker details',
            functionGroup: FunctionGroup.CLUSTER
          },
          {
            id: 24,
            name: SystemFunctionName.USER_GROUPS,
            label: 'Manage user groups',
            functionGroup: FunctionGroup.ADMIN
          },
          {
            id: 25,
            name: SystemFunctionName.USER_GROUPS_LIST,
            label: 'Groups list',
            functionGroup: FunctionGroup.ADMIN
          },
          {
            id: 26,
            name: SystemFunctionName.USER_GROUP_CREATE,
            label: 'Add new group',
            functionGroup: FunctionGroup.ADMIN
          },
          {
            id: 27,
            name: SystemFunctionName.USER_GROUP_UPDATE,
            label: 'Update group',
            functionGroup: FunctionGroup.ADMIN
          },
          {
            id: 28,
            name: SystemFunctionName.USER_GROUP_DELETE,
            label: 'Delete group',
            functionGroup: FunctionGroup.ADMIN
          }
        ]},
      {id: 2, code: 'editor_group', name: 'Editor group', functions: [
          {
            id: 1,
            name: SystemFunctionName.TOPIC_LIST,
            label: 'Topic list',
            functionGroup: FunctionGroup.TOPIC
          },
          {
            id: 2,
            name: SystemFunctionName.TOPIC_CREATE,
            label: 'Create new topic',
            functionGroup: FunctionGroup.TOPIC
          },
          {
            id: 3,
            name: SystemFunctionName.TOPIC_UPDATE,
            label: 'Update topic',
            functionGroup: FunctionGroup.TOPIC
          },
          {
            id: 4,
            name: SystemFunctionName.TOPIC_DELETE,
            label: 'Delete topic',
            functionGroup: FunctionGroup.TOPIC
          },
          {
            id: 5,
            name: SystemFunctionName.TOPIC_MESSAGES,
            label: 'View topic messages',
            functionGroup: FunctionGroup.TOPIC
          },
          {
            id: 6,
            name: SystemFunctionName.TOPIC_SEND_MESSAGE,
            label: 'Send message',
            functionGroup: FunctionGroup.TOPIC
          },
          {
            id: 7,
            name: SystemFunctionName.TOPIC_RESEND_MESSAGE,
            label: 'Resend message',
            functionGroup: FunctionGroup.TOPIC
          },
          {
            id: 11,
            name: SystemFunctionName.TRACK_LIST,
            label: 'View event track list',
            functionGroup: FunctionGroup.TOPIC
          },
          {
            id: 12,
            name: SystemFunctionName.SCHEMA_LIST,
            label: 'View schema list',
            functionGroup: FunctionGroup.SCHEMA_REGISTRY
          },
          {
            id: 13,
            name: SystemFunctionName.SCHEMA_DETAILS,
            label: 'View schema details',
            functionGroup: FunctionGroup.SCHEMA_REGISTRY
          },
          {
            id: 14,
            name: SystemFunctionName.SCHEMA_CREATE,
            label: 'Create new schema',
            functionGroup: FunctionGroup.SCHEMA_REGISTRY
          },
          {
            id: 15,
            name: SystemFunctionName.SCHEMA_UPDATE,
            label: 'Update schema',
            functionGroup: FunctionGroup.SCHEMA_REGISTRY
          },
          {
            id: 16,
            name: SystemFunctionName.SCHEMA_DELETE,
            label: 'Delete schema',
            functionGroup: FunctionGroup.SCHEMA_REGISTRY
          },
          {
            id: 17,
            name: SystemFunctionName.CLUSTER_LIST,
            label: 'Cluster list',
            functionGroup: FunctionGroup.CLUSTER
          },
          {
            id: 18,
            name: SystemFunctionName.CLUSTER_CREATE,
            label: 'Create new cluster',
            functionGroup: FunctionGroup.CLUSTER
          },
          {
            id: 19,
            name: SystemFunctionName.CLUSTER_UPDATE,
            label: 'Update cluster',
            functionGroup: FunctionGroup.CLUSTER
          },
          {
            id: 20,
            name: SystemFunctionName.CLUSTER_DETAILS,
            label: 'View cluster details',
            functionGroup: FunctionGroup.CLUSTER
          },
          {
            id: 21,
            name: SystemFunctionName.CLUSTER_DELETE,
            label: 'Delete cluster',
            functionGroup: FunctionGroup.CLUSTER
          }
        ]},
      {id: 3, code: 'viewer_group', name: 'Viewer group', functions: [
          {
            id: 1,
            name: SystemFunctionName.TOPIC_LIST,
            label: 'Topic list',
            functionGroup: FunctionGroup.TOPIC
          },
          {
            id: 5,
            name: SystemFunctionName.TOPIC_MESSAGES,
            label: 'View topic messages',
            functionGroup: FunctionGroup.TOPIC
          },
          {
            id: 11,
            name: SystemFunctionName.TRACK_LIST,
            label: 'View event track list',
            functionGroup: FunctionGroup.TOPIC
          },
          {
            id: 12,
            name: SystemFunctionName.SCHEMA_LIST,
            label: 'View schema list',
            functionGroup: FunctionGroup.SCHEMA_REGISTRY
          },
          {
            id: 13,
            name: SystemFunctionName.SCHEMA_DETAILS,
            label: 'View schema details',
            functionGroup: FunctionGroup.SCHEMA_REGISTRY
          },
          {
            id: 17,
            name: SystemFunctionName.CLUSTER_LIST,
            label: 'Cluster list',
            functionGroup: FunctionGroup.CLUSTER
          },
          {
            id: 20,
            name: SystemFunctionName.CLUSTER_DETAILS,
            label: 'View cluster details',
            functionGroup: FunctionGroup.CLUSTER
          }
        ]}
    ]);
  }

  updatePermissions$(_userGroups: Array<UserGroup>): Observable<void> {
    return of();
  }
}
