import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {UserGroup} from '../../user-groups-functions-matrix/user-groups.model';

@Injectable()
export abstract class UserGroupsService {

  abstract getUserGroups$(): Observable<Array<UserGroup>>;
}
