import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {UserGroup} from '../../user-groups-functions-matrix/user-groups.model';

@Injectable()
export abstract class UserGroupService {

  abstract createUserGroup$(userGroup: UserGroup): Observable<void>;

  abstract updateUserGroup$(userGroup: UserGroup): Observable<void>;

  abstract getUserGroup$(id: number): Observable<UserGroup>;

  abstract deleteUserGroup$(id: number): Observable<void>;

  abstract isUserGroupCodeUnique$(id: number | null, userGroupName: string): Observable<boolean>;
}
