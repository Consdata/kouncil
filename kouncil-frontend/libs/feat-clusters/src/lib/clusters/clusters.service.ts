import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Clusters} from './cluster.model';

@Injectable()
export abstract class ClustersService {

  abstract getClusters$(): Observable<Clusters>;
}
