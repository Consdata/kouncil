import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Topics} from '@app/common-model';

@Injectable()
export abstract class TopicsService {

  abstract getTopics$(serverId: string): Observable<Topics>;
}
