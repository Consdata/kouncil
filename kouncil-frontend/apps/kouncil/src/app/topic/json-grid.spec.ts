import {Column, JsonGrid} from './json-grid';
import {DatePipe} from '@angular/common';
import {createServiceFactory, SpectatorService} from '@ngneat/spectator';
import {JsonGridData} from './json-grid-data';

describe('JsonGrid', () => {
  let spectator: SpectatorService<JsonGrid>;
  const createService = createServiceFactory({
    service: JsonGrid,
    providers: [DatePipe]
  });

  beforeEach(() => spectator = createService());

  function tryParseJsonToRecord(message: string): Record<string, unknown> {
    try {
      const parsedMessage = JSON.parse(message);
      return parsedMessage && typeof parsedMessage === 'object' ? parsedMessage : {};
    } catch (e) {
      return {};
    }
  }

  function replaceObjects(value: string) {
    const values: JsonGridData[] = [];
    values.push({
      value: value,
      valueFormat: 'STRING',
      valueJson: tryParseJsonToRecord(value),
      partition: 3,
      offset: 47,
      key: '30',
      keyFormat: 'STRING',
      keyJson: tryParseJsonToRecord('30'),
      timestamp: 1678987527474,
      headers: [{key: 'traceId', value: '30'}],
      topic: 'TestTopic'
    } as JsonGridData);

    spectator.service.replaceObjects(values);
  }

  it('should have empty rows and columns', () => {
    expect(spectator.service.getRows().length).toBe(0);
    expect(spectator.service.getColumns().size).toBe(0);
  });

  it('should generate additional columns for provided simple object', () => {
    const value = '{"id": 30,"incomingDate": "27-07-2022 08:36:15.959","transactionId": "BBB00101","flags": "CUSTOMER",' +
      '"description": "Synergistic Linen Lamp","sender": "Maureen","addressee": "Thad","city": "Lianaburgh",' +
      '"street": "4817 Miller Land"}';
    replaceObjects(value);

    expect(spectator.service.getRows().length).toBe(1);
    expect(Object.keys(spectator.service.getRows()[0]))
    .toEqual([
      'H[traceId]',
      'V[id]',
      'V[incomingDate]',
      'V[transactionId]',
      'V[flags]',
      'V[description]',
      'V[sender]',
      'V[addressee]',
      'V[city]',
      'V[street]',
      'kouncilKey',
      'kouncilKeyFormat',
      'kouncilKeyJson',
      'kouncilOffset',
      'kouncilPartition',
      'kouncilTopic',
      'kouncilTimestamp',
      'kouncilTimestampEpoch',
      'kouncilValue',
      'kouncilValueFormat',
      'kouncilValueJson',
      'headers']);
    expect(spectator.service.getColumns().size).toBe(10);
    expect(spectator.service.getColumns()).toEqual(new Set<Column>([
      {name: 'H[traceId]', nameShort: 'H[traceId]'},
      {name: 'V[id]', nameShort: 'V[id]'},
      {name: 'V[incomingDate]', nameShort: 'V[incomingDate]'},
      {name: 'V[transactionId]', nameShort: 'V[transactionId]'},
      {name: 'V[flags]', nameShort: 'V[flags]'},
      {name: 'V[description]', nameShort: 'V[description]'},
      {name: 'V[sender]', nameShort: 'V[sender]'},
      {name: 'V[addressee]', nameShort: 'V[addressee]'},
      {name: 'V[city]', nameShort: 'V[city]'},
      {name: 'V[street]', nameShort: 'V[street]'}
    ]));
  });

  it('should generate additional columns for provided object with array properties', () => {
    const value = '{"id": 30,"incomingDate": "27-07-2022 08:36:15.959","transactionId": "BBB00101","flags": "CUSTOMER",' +
      '"description": "Synergistic Linen Lamp","sender": "Maureen","addressee": "Thad","city": "Lianaburgh",' +
      '"street": "4817 Miller Land","shortArray":[{"id":"1"},{"id":"2"},{"id":"3"}],"longArray":[{"id":"1"},{"id":"2"},' +
      '{"id":"3"},{"id":"4"},{"id":"5"},{"id":"6"},{"id":"7"},{"id":"8"},{"id":"9"},{"id":"10"},{"id":"11"},{"id":"12"}]}';
    replaceObjects(value);

    expect(spectator.service.getRows().length).toBe(1);
    expect(Object.keys(spectator.service.getRows()[0]))
    .toEqual([
      'H[traceId]',
      'V[id]',
      'V[incomingDate]',
      'V[transactionId]',
      'V[flags]',
      'V[description]',
      'V[sender]',
      'V[addressee]',
      'V[city]',
      'V[street]',
      'V[shortArray[0].id]',
      'V[shortArray[1].id]',
      'V[shortArray[2].id]',
      'V[longArray]',
      'kouncilKey',
      'kouncilKeyFormat',
      'kouncilKeyJson',
      'kouncilOffset',
      'kouncilPartition',
      'kouncilTopic',
      'kouncilTimestamp',
      'kouncilTimestampEpoch',
      'kouncilValue',
      'kouncilValueFormat',
      'kouncilValueJson',
      'headers']);
    expect(spectator.service.getColumns().size).toBe(14);
    expect(spectator.service.getColumns()).toEqual(new Set<Column>([
      {name: 'H[traceId]', nameShort: 'H[traceId]'},
      {name: 'V[id]', nameShort: 'V[id]'},
      {name: 'V[incomingDate]', nameShort: 'V[incomingDate]'},
      {name: 'V[transactionId]', nameShort: 'V[transactionId]'},
      {name: 'V[flags]', nameShort: 'V[flags]'},
      {name: 'V[description]', nameShort: 'V[description]'},
      {name: 'V[sender]', nameShort: 'V[sender]'},
      {name: 'V[addressee]', nameShort: 'V[addressee]'},
      {name: 'V[city]', nameShort: 'V[city]'},
      {name: 'V[street]', nameShort: 'V[street]'},
      {name: 'V[longArray]', nameShort: 'V[longArray]'},
      {name: 'V[shortArray[0].id]', nameShort: 'V[s~[0].id]'},
      {name: 'V[shortArray[1].id]', nameShort: 'V[s~[1].id]'},
      {name: 'V[shortArray[2].id]', nameShort: 'V[s~[2].id]'}
    ]));
  });

  it('should generate additional columns for provided object with embedded object', () => {
    const value = '{"id": 30,"incomingDate": "27-07-2022 08:36:15.959","transactionId": "BBB00101","flags": "CUSTOMER",' +
      '"description": "Synergistic Linen Lamp","sender": "Maureen","addressee": "Thad","address":{"city": "Lianaburgh",' +
      '"street": "4817 Miller Land"}}';
    replaceObjects(value);

    expect(spectator.service.getRows().length).toBe(1);
    expect(Object.keys(spectator.service.getRows()[0]))
    .toEqual([
      'H[traceId]',
      'V[id]',
      'V[incomingDate]',
      'V[transactionId]',
      'V[flags]',
      'V[description]',
      'V[sender]',
      'V[addressee]',
      'V[address.city]',
      'V[address.street]',
      'kouncilKey',
      'kouncilKeyFormat',
      'kouncilKeyJson',
      'kouncilOffset',
      'kouncilPartition',
      'kouncilTopic',
      'kouncilTimestamp',
      'kouncilTimestampEpoch',
      'kouncilValue',
      'kouncilValueFormat',
      'kouncilValueJson',
      'headers']);
    expect(spectator.service.getColumns().size).toBe(10);
    expect(spectator.service.getColumns()).toEqual(new Set<Column>([
      {name: 'H[traceId]', nameShort: 'H[traceId]'},
      {name: 'V[id]', nameShort: 'V[id]'},
      {name: 'V[incomingDate]', nameShort: 'V[incomingDate]'},
      {name: 'V[transactionId]', nameShort: 'V[transactionId]'},
      {name: 'V[flags]', nameShort: 'V[flags]'},
      {name: 'V[description]', nameShort: 'V[description]'},
      {name: 'V[sender]', nameShort: 'V[sender]'},
      {name: 'V[addressee]', nameShort: 'V[addressee]'},
      {name: 'V[address.city]', nameShort: 'V[a~.city]'},
      {name: 'V[address.street]', nameShort: 'V[a~.street]'}
    ]));
  });
});

