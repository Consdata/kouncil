import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {Clusters} from './cluster.model';
import {ClustersService} from './clusters.service';

@Injectable({
  providedIn: 'root'
})
export class ClustersDemoService implements ClustersService {
  getClusters$(): Observable<Clusters> {
    return of();
  }

}
