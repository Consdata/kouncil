import {Backend} from '../app/app.backend';
const webSocketProtocol = 'https:' === window.location.protocol ? 'wss://' : 'ws://';
export const environment = {
  production: true,
  backend: Backend.SERVER,
  websocketUrl: `${webSocketProtocol}${window.location.host}/ws`
};
