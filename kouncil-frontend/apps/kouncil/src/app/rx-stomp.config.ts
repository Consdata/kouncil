import {environment} from '../environments/environment';
import {RxStompConfig} from '@stomp/rx-stomp';
import {LoggerFactory} from '@consdata/logger-api';

const log = LoggerFactory.getLogger('RxStompConfig');

export const RX_STOMP_CONFIG: RxStompConfig = {
  brokerURL: `${environment.websocketUrl}`,
  heartbeatIncoming: 0,
  heartbeatOutgoing: 20000,
  reconnectDelay: 2000,
  debug: (msg: string): void => {
    log.debug('RxStompConfig.debug: msg={}', msg);
  },
};
