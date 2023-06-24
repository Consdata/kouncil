import {MessageFormat} from './message-format';

export interface Schemas {
  messageFormat: MessageFormat;
  plainTextSchema: string;
  topicName: string;
  subjectName: string;
  version: number;
}
