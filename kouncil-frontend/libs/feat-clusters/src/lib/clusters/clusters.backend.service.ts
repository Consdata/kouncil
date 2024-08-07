import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Clusters} from './cluster.model';
import {ClustersService} from './clusters.service';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ClustersBackendService implements ClustersService {
  constructor(private http: HttpClient) {
  }

  getClusters$(): Observable<Clusters> {
    return this.http.get<Clusters>(`/api/clusters`);
  }
}
