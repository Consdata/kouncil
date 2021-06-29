import {Injectable} from '@angular/core';
import {TopicMessages} from './topic-messages';
import {Message} from './message';
import {TopicBackendService} from './topic.backend.service';
import {demoTopics} from '../topics/topics.demo.data';
import {HttpClient} from '@angular/common/http';
import {ProgressBarService} from '../util/progress-bar.service';
import {MessageHeader} from './message-header';

@Injectable({
  providedIn: 'root'
})
export class TopicDemoService extends TopicBackendService {

  constructor(public http: HttpClient, public progressBarService: ProgressBarService) {
    super(http, progressBarService);
  }

  private static createRandomIban(): string {
    let ktnr, iban;
    let pruef, pruef2;
    ktnr = (Math.round(Math.random() * 8999999) + 1000000);
    pruef = ((ktnr * 1000000) + 43);
    pruef2 = pruef % 97;
    pruef = 98 - pruef2;
    if (pruef > 9) {
      iban = 'DE';
    } else {
      iban = 'DE0';
    }
    return iban + pruef + '70050000' + '000' + ktnr;
  }

  private static randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  private static formatAmount(x: number): string {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  private static randomDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }

  private static createRandomEvent(): string {
    const today = new Date();
    const nextDay = new Date();
    nextDay.setDate(today.getDate() + 3);
    return `{
      "source_account": "${TopicDemoService.createRandomIban()}",
      "dst_account": "${TopicDemoService.createRandomIban()}",
      "currency": "EUR",
      "amount": "${TopicDemoService.formatAmount(TopicDemoService.randomInt(100, 10000000))}",
      "transaction_date": "${TopicDemoService.randomDate(today, nextDay).toLocaleDateString()}"
      }
    `;
  }

  getMessages(serverId: string, topicName: string) {
    const partitionOffsets = {};
    let totalResults = 0;
    const partitions = demoTopics.filter(t => t.name === topicName)[0].partitions;
    for (let i = 0; i < partitions; i++) {
      const randomOffset = TopicDemoService.randomInt(100000000, 200000000);
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
    let partition = TopicDemoService.randomInt(0, partitions - 1);
    if (this.selectedPartition !== undefined) {
      partition = parseInt(this.selectedPartition, 10);
    }
    const pagination = this.paginationChanged$.getValue();
    return new Message(
      this.uuidv4(),
      TopicDemoService.createRandomEvent(),
      partitionOffsets[partition] - (pagination.size * pagination.pageNumber) - i,
      partition,
      new Date().getTime(),
      [new MessageHeader('traceId', this.uuidv4())]
    );
  }

  private uuidv4(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

}
