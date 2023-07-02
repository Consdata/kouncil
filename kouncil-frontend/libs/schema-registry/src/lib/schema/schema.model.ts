import {MessageFormat} from './message-format';

export interface Schema {
  messageFormat: MessageFormat;
  plainTextSchema: string;
  topicName: string;
  subjectName: string;
  version: number;
  isKey: boolean;
}
