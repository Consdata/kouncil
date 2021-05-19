import { Injectable } from '@angular/core';
import {SendService} from './send.service';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Message} from '../topic/message';

@Injectable({
  providedIn: 'root'
})
export class SendBackendService implements SendService {

  constructor(private http: HttpClient) { }

  send(serverId: string, topic: string, count: number, message: Message): Observable<Object> {
    const params = new HttpParams().set('serverId', serverId);
    return this.http.post(`/api/topic/send/${topic}/${count}`, message, {params});
  }
}
