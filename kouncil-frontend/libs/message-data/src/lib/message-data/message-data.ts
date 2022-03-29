import {MessageDataHeader} from './message-data-header';

export interface MessageData {
  key: string;
  value: string;
  offset: number | null;
  partition: number | null;
  timestamp?: number | null;
  headers?: MessageDataHeader[];
  topicName: string;
}
