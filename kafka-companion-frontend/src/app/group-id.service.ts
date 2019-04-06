import {Injectable} from '@angular/core';

@Injectable()
export class GroupIdService {

  getGroupId(): string {
    let groupId = localStorage.getItem('kafka-companion-group-id');
    if (!groupId) {
      groupId = 'kafka-companion-' + Math.floor(Math.random() * 1000000000);
      localStorage.setItem('kafka-companion-group-id', groupId)
    }
    return groupId
  }

}
