import {RxStompService} from '@app/feat-notifications';
import {RX_STOMP_CONFIG} from './rx-stomp.config';

export function rxStompServiceFactory(): RxStompService {
  const rxStomp = new RxStompService();
  rxStomp.configure(RX_STOMP_CONFIG);
  rxStomp.activate();
  return rxStomp;
}
