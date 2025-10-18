import {Injectable} from '@angular/core';
import {TopicMessages} from './topic-messages';
import {TopicBackendService} from './topic.backend.service';
import {MessageData, MessageDataHeader} from '@app/message-data';
import {Crypto, RandomUtils} from '@app/common-utils';
import {demoTopics} from '@app/feat-topics';
import {Observable, of} from 'rxjs';

@Injectable()
export class TopicDemoService extends TopicBackendService {
  override getMessages(
    serverId: string,
    topicName: string,
    offset?: number
  ): void {
    const partitionOffsets: Record<number, number> = {};
    let totalResults = 0;
    const partitions = demoTopics.filter((t) => t.name === topicName)[0]
      .partitions;
    for (let i = 0; i < partitions; i++) {
      const randomOffset = RandomUtils.randomInt(100000000, 200000000);
      partitionOffsets[i] = randomOffset;
      totalResults += randomOffset;
    }

    const actualPartitions = this.selectedPartition === 'all' ? partitions : 1;
    const size =
      !!offset || offset === 0
        ? actualPartitions
        : this.paginationChanged$.getValue().size;
    const messages = [] as MessageData[];
    for (let i = 0; i < size; i++) {
      messages.push(
        this.createRandomMessage(i, partitions, partitionOffsets, offset)
      );
    }

    const data = new TopicMessages(
      messages,
      partitionOffsets,
      partitionOffsets,
      totalResults
    );
    this.processMessagesData(data);
  }

  private createRandomMessage(
    i: number,
    partitions: number,
    partitionOffsets: Record<number, number>,
    offset?: number
  ): MessageData {
    let partition = RandomUtils.randomInt(0, partitions - 1);
    if (
      this.selectedPartition !== undefined &&
      this.selectedPartition !== 'all'
    ) {
      partition = parseInt(this.selectedPartition, 10);
    }
    const pagination = this.paginationChanged$.getValue();
    let messageOffset;
    if (!!offset || offset === 0) {
      messageOffset = offset;
    } else {
      messageOffset =
        partitionOffsets[partition] -
        pagination.size * pagination.pageNumber -
        i;
    }
    return {
      key: Crypto.uuidv4(),
      value: RandomUtils.createRandomEvent(),
      offset: messageOffset,
      partition: partition,
      timestamp: new Date().getTime(),
      headers: [{key: 'traceId', value: Crypto.uuidv4()} as MessageDataHeader],
      topicName: ''
    } as MessageData;
  }

  override isTopicExist$(_serverId: string, _topicName: string): Observable<boolean> {
    return of(true);
  }
}
