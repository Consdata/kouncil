import {Injectable} from '@angular/core';
import {TopicMessages} from './topic';
import {Message} from './message';
import {TopicBackendService} from './topic.backend.service';

@Injectable({
  providedIn: 'root'
})
export class TopicDemoService extends TopicBackendService {

  getMessages(topicName: string) {
    const messages = [] as Message[];
    for (let i = 0; i < 400; i++) {
      messages.push(this.createRandomMessage(i));
    }
    const partitionOffsets = {
      0: this.randomInt(100000000, 200000000),
      2: this.randomInt(100000000, 200000000),
      3: this.randomInt(100000000, 200000000),
      4: this.randomInt(100000000, 200000000)
    };
    const data = new TopicMessages(messages, partitionOffsets, partitionOffsets, 1049990230);
    this.processMessagesData(data);
    this.onePartitionSelected();
  }

  private createRandomMessage(i: number): Message {
    return new Message(
      this.uuidv4(),
      this.createRandomEvent(),
      243532543 - i,
      this.randomInt(0, 3),
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
