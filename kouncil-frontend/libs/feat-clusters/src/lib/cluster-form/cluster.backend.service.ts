import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {ClusterMetadata} from '../cluster.model';
import {HttpClient} from '@angular/common/http';
import {ClusterService} from './cluster.service';

@Injectable({
  providedIn: 'root'
})
export class ClusterBackendService implements ClusterService {

  constructor(private http: HttpClient) {
  }

  getClusterByName$(clusterName: string): Observable<ClusterMetadata> {
    return this.http.get<ClusterMetadata>(`/api/cluster/${clusterName}`);
  }

  addNewCluster$(cluster: ClusterMetadata): Observable<string> {
    return this.http.post('/api/cluster', cluster, {responseType: 'text'});
  }

  updateCluster$(cluster: ClusterMetadata): Observable<string> {
    return this.http.put('/api/cluster', cluster, {responseType: 'text'});
  }

  testConnection$(cluster: ClusterMetadata): Observable<boolean> {
    return this.http.post<boolean>('/api/cluster/test-connection', cluster);
  }

  isClusterNameUnique$(clusterName: string): Observable<boolean> {
    return this.http.get<boolean>(`/api/cluster/${clusterName}/is-cluster-name-unique`);
  }

  deleteCluster$(id: number): Observable<void> {
    return this.http.delete<void>(`/api/cluster/${id}`);
  }
}
