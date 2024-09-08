import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {ClusterService} from './cluster.service';
import {ClusterMetadata} from '../cluster.model';

@Injectable({
  providedIn: 'root'
})
export class ClusterDemoService implements ClusterService {

  addNewCluster$(_cluster: ClusterMetadata): Observable<string> {
    return of();
  }

  getClusterByName$(_clusterName: string): Observable<ClusterMetadata> {
    return of();
  }

  updateCluster$(_cluster: ClusterMetadata): Observable<string> {
    return of();
  }

  testConnection$(_cluster: ClusterMetadata): Observable<boolean> {
    return of();
  }

  isClusterNameUnique$(_clusterName: string): Observable<boolean> {
    return of();
  }

  deleteCluster$(_id: number): Observable<void> {
    return of();
  }

}
