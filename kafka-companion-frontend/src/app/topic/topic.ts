import { Message } from "app/topic/message";

export class TopicMessages {
  constructor(public messages: Message[], public partitionOffsets: {[key: number]: number}) {

  }
}
