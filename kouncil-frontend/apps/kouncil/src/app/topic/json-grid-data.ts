import {MessageDataHeader} from '@app/message-data';
import {MessageFormat} from '@app/schema-registry';

export interface JsonGridData {
  value: string;
  originalValue: string;
  valueFormat: MessageFormat;
  valueJson: Record<string, unknown>;
  partition: number | null;
  offset: number | null;
  key: string;
  keyFormat: MessageFormat;
  keyJson: Record<string, unknown>;
  timestamp: number | null;
  headers: MessageDataHeader[];
  topic: string;
}
