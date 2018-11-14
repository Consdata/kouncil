export class Assignment {

  clientId: string;
  consumerId: string;
  host: string;
  partition: number;
  topic: string;
  offset: number;
  endOffset: number;
  lag: number;

}


export class ConsumerGroupResponse {
  assignments: Assignment[];
}
