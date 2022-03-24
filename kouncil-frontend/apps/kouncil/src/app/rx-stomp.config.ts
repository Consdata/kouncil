import {InjectableRxStompConfig} from '@stomp/ng2-stompjs';
import {environment} from '../environments/environment';

export const RX_STOMP_CONFIG: InjectableRxStompConfig = {
  brokerURL: `${environment.websocketUrl}`,
  heartbeatIncoming: 0,
  heartbeatOutgoing: 20000,
  reconnectDelay: 2000,
  debug: (msg: string): void => {
    console.log('RxStompConfig.debug: msg={}', msg);
  },
};
