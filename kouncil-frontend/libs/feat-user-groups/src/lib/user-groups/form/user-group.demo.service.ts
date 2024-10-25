import {Injectable} from '@angular/core';
import {UserGroupService} from './user-group.service';
import {Observable, of} from 'rxjs';
import {UserGroup} from '../../user-groups-functions-matrix/user-groups.model';

@Injectable({
  providedIn: 'root',
})
export class UserGroupDemoService implements UserGroupService {

  createUserGroup$(_userGroup: UserGroup): Observable<void> {
    return of();
  }

  deleteUserGroup$(_id: number): Observable<void> {
    return of();
  }

  getUserGroup$(_id: number): Observable<UserGroup> {
    return of();
  }

  updateUserGroup$(_userGroup: UserGroup): Observable<void> {
    return of();
  }

  isUserGroupCodeUnique$(_id: number | null, _userGroupName: string): Observable<boolean> {
    return of();
  }
}
