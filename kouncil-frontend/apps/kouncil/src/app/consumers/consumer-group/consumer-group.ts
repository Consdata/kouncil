export interface ConsumerGroupOffset {

  clientId: string;
  consumerId: string;
  host: string;
  partition: number;
  topic: string;
  offset: number;
  endOffset: number;
  lag: number;
  pace: number;
}


export interface ConsumerGroupResponse {
  consumerGroupOffset: ConsumerGroupOffset[];
}
