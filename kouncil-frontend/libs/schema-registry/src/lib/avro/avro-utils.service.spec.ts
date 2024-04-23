import {AvroUtilsService} from './avro-utils.service';
import {createServiceFactory, mockProvider, SpectatorService} from '@ngneat/spectator/jest';
import {RandomIntGeneratorService} from '../generators/random-int-generator.service';
import {RandomFloatGeneratorService} from '../generators/random-float-generator.service';
import {RandomStringGeneratorService} from '../generators/random-string-generator.service';
import {RandomDateGeneratorService} from '../generators/random-date-generator.service';
import {RandomUuidGeneratorService} from '../generators/random-uuid-generator.service';

const testAvroSchema = `
{
    "type": "record",
    "name": "test",
    "namespace": "com.consadata.kouncil",
    "fields": [
        {
            "name": "testString",
            "type": "string"
        },
        {
            "name": "testInt",
            "type": "int"
        },
        {
            "name": "testLong",
            "type": "long"
        },
        {
            "name": "testDouble",
            "type": "double"
        },
        {
            "name": "testSubType",
            "type": {
                "type": "record",
                "name": "testSubType",
                "fields": [
                    {
                        "name": "testEnum",
                        "type": {
                            "type": "enum",
                            "name": "City",
                            "symbols": [
                                "VALUE_1",
                                "VALUE_2",
                                "VALUE_3",
                                "VALUE_4"
                            ]
                        }
                    },
                    {
                        "name": "testUnion",
                        "type": [
                            "string",
                            "null"
                        ]
                    },
                    {
                        "name": "testBoolean",
                        "type": "boolean"
                    },
                    {
                        "name": "testArray",
                        "type": {
                            "type": "array",
                            "items": "string"
                        }
                    },
                    {
                        "name": "testMap",
                        "type": {
                            "type": "map",
                            "values": "string"
                        }
                    },
                    {
                        "name": "testBytes",
                        "type": "bytes"
                    }
                ]
            }
        },
        {
            "name": "testUUID",
            "type": {
                "type": "string",
                "logicalType": "uuid"
            }
        },
        {
            "name": "testDecimal",
            "type": {
                "type": "bytes",
                "logicalType": "decimal",
                "precision": 3,
                "scale": 1
            }
        },
        {
            "name": "testDate",
            "type": {
                "type": "int",
                "logicalType": "date"
            }
        },
        {
            "name": "testTimeMillis",
            "type": {
                "type": "int",
                "logicalType": "time-millis"
            }
        },
        {
            "name": "testTimeMicros",
            "type": {
                "type": "long",
                "logicalType": "time-micros"
            }
        },
        {
            "name": "testTimeStampMillis",
            "type": {
                "type": "long",
                "logicalType": "timestamp-millis"
            }
        },
        {
            "name": "testTimeStampMicros",
            "type": {
                "type": "long",
                "logicalType": "timestamp-micros"
            }
        },
        {
            "name": "testLocalTimeStampMicros",
            "type": {
                "type": "long",
                "logicalType": "local-timestamp-micros"
            }
        },
        {
            "name": "testLocalTimeStampMillis",
            "type": {
                "type": "long",
                "logicalType": "local-timestamp-millis"
            }
        }
    ]
}
`;

describe('AvroUtilsService', () => {
  let spectator: SpectatorService<AvroUtilsService>;
  const now = new Date();

  const createService = createServiceFactory({
    service: AvroUtilsService,
    providers: [
      mockProvider(RandomIntGeneratorService, {
        getRandomInt(): number {
          return 123;
        }
      }),
      mockProvider(RandomFloatGeneratorService, {
        getRandomFloat(): number {
          return 123.123;
        }
      }),
      mockProvider(RandomStringGeneratorService, {
        getRandomString(): string {
          return 'abc';
        }
      }),
      mockProvider(RandomDateGeneratorService, {
        getRandomDate(): number {
          return now.getTime();
        },

        getTimeSinceMidnight(): number {
          const date = this.getRandomDate();
          const midnight = new Date(date).setHours(0, 0, 0, 0);
          return date - midnight;
        }
      }),
      mockProvider(RandomUuidGeneratorService, {
        getRandomUUID(): string {
          return '14999e3d-f8e8-4eb0-8a10-5021d8edf44c';
        }
      })
    ]
  });

  beforeEach(() => spectator = createService());

  it('should fill protobuf schema with proper data', () => {
    const midnight = new Date(now).setHours(0, 0, 0, 0);

    const actualAvroWithData = spectator.service.fillAvroSchemaWithData(testAvroSchema);
    expect(actualAvroWithData['testString']).toEqual('abc');
    expect(actualAvroWithData['testInt']).toEqual(123);
    expect(actualAvroWithData['testLong']).toEqual(123);
    expect(actualAvroWithData['testSubType']).not.toBeNull();
    expect(['VALUE_1', 'VALUE_2', 'VALUE_3', 'VALUE_4']).toContain(actualAvroWithData['testSubType']['testEnum']);
    expect(actualAvroWithData['testSubType']['testUnion'] === null || actualAvroWithData['testSubType']['testUnion'] === 'abc').toBeTruthy();
    expect(actualAvroWithData['testSubType']['testBoolean'] || !actualAvroWithData['testSubType']['testBoolean']).toBeTruthy();
    if (actualAvroWithData['testSubType']['testArray'].length > 0) {
      actualAvroWithData['testSubType']['testArray'].forEach(element => {
        expect(element).toEqual('abc');
      });
    } else {
      expect(actualAvroWithData['testSubType']['testArray']).toEqual([]);
    }

    if (actualAvroWithData['testSubType']['testMap'].length > 0) {
      actualAvroWithData['testSubType']['testMap'].entries((key, value) => {
        expect(key).toEqual('abc');
        expect(value).toEqual('abc');
      });
    } else {
      expect(actualAvroWithData['testSubType']['testMap']).toEqual([]);
    }
    expect(actualAvroWithData['testSubType']['testBytes']).toEqual('abc');

    expect(actualAvroWithData['testUUID']).toEqual('14999e3d-f8e8-4eb0-8a10-5021d8edf44c');
    expect(actualAvroWithData['testDecimal']).toEqual('\\u007b');
    expect(actualAvroWithData['testDate']).toEqual(Math.floor(now.getTime() / 8.64e7));
    expect(actualAvroWithData['testTimeMillis']).toEqual(now.getTime() - midnight);
    expect(actualAvroWithData['testTimeMicros']).toEqual((now.getTime() - midnight) * 1000);
    expect(actualAvroWithData['testTimeStampMillis']).toEqual(now.getTime());
    expect(actualAvroWithData['testTimeStampMicros']).toEqual(now.getTime() * 1000);
    expect(actualAvroWithData['testLocalTimeStampMicros']).toEqual(now.getTime() * 1000);
    expect(actualAvroWithData['testLocalTimeStampMillis']).toEqual(now.getTime());
  });
});
