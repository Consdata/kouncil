import {Injectable} from '@angular/core';
import {Server} from './navbar/navbar.component';

@Injectable()
export class Globals {
  selectedServer: Server;
}
