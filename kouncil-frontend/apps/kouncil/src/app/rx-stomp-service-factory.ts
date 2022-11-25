import { RxStompService } from './rx-stomp.service';
import {RX_STOMP_CONFIG} from "./rx-stomp.config";

export function rxStompServiceFactory() {
  const rxStomp = new RxStompService();
  rxStomp.configure(RX_STOMP_CONFIG);
  rxStomp.activate();
  return rxStomp;
}
