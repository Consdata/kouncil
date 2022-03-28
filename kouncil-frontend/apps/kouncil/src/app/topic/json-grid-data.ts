import {MessageDataHeader} from '@app/message-data';

export interface JsonGridData {
  value: string;
  valueJson: Record<string, unknown>;
  partition: number | null;
  offset: number | null;
  key: string;
  timestamp: number | null;
  headers: MessageDataHeader[];
}
