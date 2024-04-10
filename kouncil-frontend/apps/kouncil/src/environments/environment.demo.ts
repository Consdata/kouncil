import {Backend} from '@app/common-model';

const webSocketProtocol: string = 'https:' === window.location.protocol ? 'wss://' : 'ws://';
export const environment: { production: boolean; websocketUrl: string; backend: Backend, baseUrl: string } = {
  production: false,
  backend: Backend.DEMO,
  websocketUrl: `${webSocketProtocol}${window.location.host}/ws`,
  baseUrl: `${window.location.protocol}//${window.location.host}`
};
