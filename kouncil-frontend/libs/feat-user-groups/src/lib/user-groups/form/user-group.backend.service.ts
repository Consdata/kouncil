import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {UserGroupService} from './user-group.service';
import {Observable} from 'rxjs';
import {UserGroup} from '../../user-groups-functions-matrix/user-groups.model';

@Injectable({
  providedIn: 'root'
})
export class UserGroupBackendService implements UserGroupService {

  constructor(private http: HttpClient) {
  }

  createUserGroup$(userGroup: UserGroup): Observable<void> {
    return this.http.post<void>('/api/user-group', userGroup);
  }

  getUserGroup$(id: number): Observable<UserGroup> {
    return this.http.get<UserGroup>(`/api/user-group/${id}`);
  }

  updateUserGroup$(userGroup: UserGroup): Observable<void> {
    return this.http.put<void>(`/api/user-group`, userGroup);
  }

  deleteUserGroup$(id: number): Observable<void> {
    return this.http.delete<void>(`/api/user-group/${id}`,);
  }

  isUserGroupCodeUnique$(id: number | null, code: string): Observable<boolean> {
    return this.http.post<boolean>(`/api/user-group/is-user-group-code-unique`,{
      id,
      code
    });
  }
}
