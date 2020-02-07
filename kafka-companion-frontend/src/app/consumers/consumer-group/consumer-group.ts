export class ConsumerGroupOffset {

  clientId: string;
  consumerId: string;
  host: string;
  partition: number;
  topic: string;
  offset: number;
  endOffset: number;
  lag: number;
  lastLag: number = 0;
  pace:number;
}


export class ConsumerGroupResponse {
  consumerGroupOffset: ConsumerGroupOffset[];
}
