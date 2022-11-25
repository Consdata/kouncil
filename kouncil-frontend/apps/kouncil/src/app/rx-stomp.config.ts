import {environment} from '../environments/environment';
import {RxStompConfig} from "@stomp/rx-stomp";

export const RX_STOMP_CONFIG: RxStompConfig = {
  brokerURL: `${environment.websocketUrl}`,
  heartbeatIncoming: 0,
  heartbeatOutgoing: 20000,
  reconnectDelay: 2000,
  debug: (msg: string): void => {
    console.log('RxStompConfig.debug: msg={}', msg);
  },
};
