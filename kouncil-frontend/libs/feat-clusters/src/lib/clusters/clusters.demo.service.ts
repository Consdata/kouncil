import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {ClusterAuthenticationMethod, Clusters} from '../cluster.model';
import {ClustersService} from './clusters.service';

@Injectable({
  providedIn: 'root'
})
export class ClustersDemoService implements ClustersService {
  getClusters$(): Observable<Clusters> {
    return of(
      {
        clusters: [
          {
            id: 1,
            name: 'first.server.local',
            brokers: [
              {
                id: 1,
                bootstrapServer: 'first.server.local:9092'
              }
            ],
            clusterSecurityConfig: {
              authenticationMethod: ClusterAuthenticationMethod.NONE
            }
          },
          {
            id: 2,
            name: 'second.server.local',
            brokers: [
              {
                id: 1,
                bootstrapServer: 'second.server.local:9092'
              }
            ],
            clusterSecurityConfig: {
              authenticationMethod: ClusterAuthenticationMethod.NONE
            }
          }
        ]
      }
    );
  }

}
