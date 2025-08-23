export interface ConsumerGroupResetOffset {
  serverId: string;
  groupId: string;
  resetType: ConsumerGroupResetOffsetType;
  timestampMillis: number;
  offsetNo: number;
  date: string;
  time: string;
}

export enum ConsumerGroupResetOffsetType {
  EARLIEST = 'Earliest',
  LATEST = 'Latest',
  TIMESTAMP = 'Timestamp',
  OFFSET_NUMBER = 'Offset number'
}
