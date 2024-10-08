import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {ClusterMetadata} from '../cluster.model';

@Injectable()
export abstract class ClusterService {

  abstract getClusterByName$(clusterName: string): Observable<ClusterMetadata>;

  abstract addNewCluster$(cluster: ClusterMetadata): Observable<string>;

  abstract updateCluster$(cluster: ClusterMetadata): Observable<string>;

  abstract testConnection$(cluster: ClusterMetadata): Observable<boolean>;

  abstract isClusterNameUnique$(clusterName: string): Observable<boolean>;

  abstract deleteCluster$(id: number): Observable<void>;
}
