import {Injectable} from '@angular/core';
import {TopicMessages} from './topic';
import {Message} from './message';
import {TopicBackendService} from './topic.backend.service';
import {demoTopics} from '../topics/topics.demo.data';
import {HttpClient} from '@angular/common/http';
import {ProgressBarService} from '../util/progress-bar.service';

@Injectable({
  providedIn: 'root'
})
export class TopicDemoService extends TopicBackendService {

  constructor(public http: HttpClient, public progressBarService: ProgressBarService) {
    super(http, progressBarService);
  }

  getMessages(topicName: string) {
    const partitionOffsets = {};
    let totalResults = 0;
    const partitions = demoTopics.filter(t => t.name === topicName)[0].partitions;
    for (let i = 0; i < partitions; i++) {
      const randomOffset = this.randomInt(100000000, 200000000);
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
    let partition = this.randomInt(0, partitions - 1);
    if (this.selectedPartition !== undefined) {
      partition = parseInt(this.selectedPartition, 10);
    }
    const pagination = this.paginationChanged$.getValue();
    return new Message(
      this.uuidv4(),
      this.createRandomEvent(),
      partitionOffsets[partition] - (pagination.size * pagination.pageNumber) - i,
      partition,
      new Date().getTime()
    );
  }

  private createRandomEvent(): string {
    const today = new Date();
    const nextDay = new Date();
    nextDay.setDate(today.getDate() + 3);
    return `{
      "source_account": "${this.createRandomIban()}",
      "dst_account": "${this.createRandomIban()}",
      "currency": "EUR",
      "amount": "${this.formatAmount(this.randomInt(100, 10000000))}",
      "transaction_date": "${this.randomDate(today, nextDay).toLocaleDateString()}"
      }
    `;
  }

  private createRandomIban(): string {
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

  private uuidv4(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  private formatAmount(x: number): string {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  private randomDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }

}
