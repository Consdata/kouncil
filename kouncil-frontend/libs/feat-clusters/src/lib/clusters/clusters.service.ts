import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Clusters} from '../clusterModel';

@Injectable()
export abstract class ClustersService {

  abstract getClusters$(): Observable<Clusters>;
}
