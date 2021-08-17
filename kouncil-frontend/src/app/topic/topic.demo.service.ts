import {Injectable} from '@angular/core';
import {TopicMessages} from './topic-messages';
import {Message} from './message';
import {TopicBackendService} from './topic.backend.service';
import {demoTopics} from '../topics/topics.demo.data';
import {HttpClient} from '@angular/common/http';
import {ProgressBarService} from '../util/progress-bar.service';
import {MessageHeader} from './message-header';
import {Crypto} from '../util/crypto';
import {RandomUtils} from '../util/random-utils';

@Injectable({
  providedIn: 'root'
})
export class TopicDemoService extends TopicBackendService {

  constructor(public http: HttpClient, public progressBarService: ProgressBarService) {
    super(http, progressBarService);
  }

  getMessages(serverId: string, topicName: string) {
    const partitionOffsets = {};
    let totalResults = 0;
    const partitions = demoTopics.filter(t => t.name === topicName)[0].partitions;
    for (let i = 0; i < partitions; i++) {
      const randomOffset = RandomUtils.randomInt(100000000, 200000000);
      partitionOffsets[i] = randomOffset;
      totalResults += randomOffset;
    }

    const size = this.paginationChanged$.getValue().size;
    const messages = [] as Message[];
    for (let i = 0; i < size; i++) {
      messages.push(this.createRandomMessage(i, partitions, partitionOffsets));
    }

    const data = new TopicMessages(messages, partitionOffsets, partitionOffsets, totalResults);
    this.processMessagesData(data);
  }

  private createRandomMessage(i: number, partitions: number, partitionOffsets: {}): Message {
    let partition = RandomUtils.randomInt(0, partitions - 1);
    if (this.selectedPartition !== undefined) {
      partition = parseInt(this.selectedPartition, 10);
    }
    const pagination = this.paginationChanged$.getValue();
    return new Message(
      Crypto.uuidv4(),
      RandomUtils.createRandomEvent(),
      partitionOffsets[partition] - (pagination.size * pagination.pageNumber) - i,
      partition,
      new Date().getTime(),
      [new MessageHeader('traceId', Crypto.uuidv4())],
      ''
    );
  }
}
