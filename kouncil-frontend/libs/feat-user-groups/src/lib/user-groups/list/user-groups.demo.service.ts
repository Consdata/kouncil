import {Injectable} from '@angular/core';
import {UserGroupsService} from './user-groups.service';
import {Observable, of} from 'rxjs';
import {UserGroup} from '../../user-groups-functions-matrix/user-groups.model';

@Injectable({
  providedIn: 'root',
})
export class UserGroupsDemoService implements UserGroupsService {

  getUserGroups$(): Observable<Array<UserGroup>> {
    return of();
  }

  updatePermissions$(_userGroups: Array<UserGroup>): Observable<void> {
    return of();
  }
}
