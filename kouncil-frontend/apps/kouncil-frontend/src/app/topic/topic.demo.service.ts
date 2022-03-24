import {Injectable} from '@angular/core';
import {TopicMessages} from './topic-messages';
import {Message} from './message';
import {TopicBackendService} from './topic.backend.service';
import {demoTopics} from '../topics/topics.demo.data';
import {MessageHeader} from './message-header';
import {Crypto} from '../util/crypto';
import {RandomUtils} from '../util/random-utils';

@Injectable()
export class TopicDemoService extends TopicBackendService {

  override getMessages(serverId: string, topicName: string, offset?: number): void {
    const partitionOffsets = {};
    let totalResults = 0;
    const partitions = demoTopics.filter(t => t.name === topicName)[0].partitions;
    for (let i = 0; i < partitions; i++) {
      const randomOffset = RandomUtils.randomInt(100000000, 200000000);
      partitionOffsets[i] = randomOffset;
      totalResults += randomOffset;
    }

    const actualPartitions = this.selectedPartition === 'all' ? partitions : 1;
    const size = !!offset || offset === 0 ? actualPartitions : this.paginationChanged$.getValue().size;
    const messages = [] as Message[];
    for (let i = 0; i < size; i++) {
      messages.push(this.createRandomMessage(i, partitions, partitionOffsets, offset));
    }

    const data = new TopicMessages(messages, partitionOffsets, partitionOffsets, totalResults);
    this.processMessagesData(data);
  }

  private createRandomMessage(i: number, partitions: number, partitionOffsets: {}, offset?: number): Message {
    let partition = RandomUtils.randomInt(0, partitions - 1);
    if (this.selectedPartition !== undefined && this.selectedPartition !== 'all') {
      partition = parseInt(this.selectedPartition, 10);
    }
    const pagination = this.paginationChanged$.getValue();
    let messageOffset;
    if (!!offset || offset === 0) {
      messageOffset = offset;
    } else {
      messageOffset = partitionOffsets[partition] - (pagination.size * pagination.pageNumber) - i;
    }
    return new Message(
      Crypto.uuidv4(),
      RandomUtils.createRandomEvent(),
      messageOffset,
      partition,
      new Date().getTime(),
      [new MessageHeader('traceId', Crypto.uuidv4())],
      ''
    );
  }
}
