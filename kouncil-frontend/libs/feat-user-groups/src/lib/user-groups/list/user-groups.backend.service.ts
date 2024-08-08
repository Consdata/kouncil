import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {UserGroupsService} from './user-groups.service';
import {Observable} from 'rxjs';
import {UserGroup} from '../../user-groups-functions-matrix/user-groups.model';

@Injectable({
  providedIn: 'root'
})
export class UserGroupsBackendService implements UserGroupsService {

  constructor(private http: HttpClient) {
  }

  getUserGroups$(): Observable<Array<UserGroup>> {
    return this.http.get<Array<UserGroup>>('/api/user-groups');
  }

  updatePermissions$(userGroups: Array<UserGroup>): Observable<void> {
    return this.http.post<void>('/api/user-groups', userGroups);
  }
}
