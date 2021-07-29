import {Backend} from '../app/app.backend';

const webSocketProtocol = 'https:' === window.location.protocol ? 'wss://' : 'ws://';
export const environment = {
  production: false,
  backend: Backend.SERVER,
  websocketUrl: `${webSocketProtocol}${window.location.hostname}:8080/ws`
};
