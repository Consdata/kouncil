import {Backend} from '@app/common-model';

const webSocketProtocol: string = 'https:' === window.location.protocol ? 'wss://' : 'ws://';
export const environment: { production: boolean; websocketUrl: string; backend: Backend, baseUrl: string } = {
  production: false,
  backend: Backend.SERVER,
  websocketUrl: `${webSocketProtocol}${window.location.hostname}:8080/ws`,
  baseUrl: `${window.location.protocol}//${window.location.hostname}:8080`
};
