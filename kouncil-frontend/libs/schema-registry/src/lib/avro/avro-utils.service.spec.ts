import {AvroUtilsService} from "./avro-utils.service";

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
        }
    ]
}
`;

describe('AvroUtilsService', () => {
  const service: AvroUtilsService = new AvroUtilsService();

  it('should fill protobuf schema with proper data', () => {
    service['getRandomInt'] = () => 123;
    service['getRandomFloat'] = () => 123.123;
    service['getRandomString'] = () => 'abc';

    const actualAvroWithData = service.fillAvroSchemaWithData(testAvroSchema);
    expect(actualAvroWithData['testString']).toEqual('abc');
    expect(actualAvroWithData['testInt']).toEqual(123);
    expect(actualAvroWithData['testLong']).toEqual(123);
    expect(actualAvroWithData['testSubType']).not.toBeNull();
    expect(['VALUE_1', 'VALUE_2', 'VALUE_3', 'VALUE_4']).toContain(actualAvroWithData['testSubType']['testEnum']);
    expect(actualAvroWithData['testSubType']['testUnion'] === null || actualAvroWithData['testSubType']['testUnion'] === 'abc').toBeTruthy()
    expect(actualAvroWithData['testSubType']['testBoolean'] || !actualAvroWithData['testSubType']['testBoolean']).toBeTruthy()
    if (actualAvroWithData['testSubType']['testArray'].length > 0) {
      actualAvroWithData['testSubType']['testArray'].forEach(element => {
        expect(element).toEqual('abc');
      })
    } else {
      expect(actualAvroWithData['testSubType']['testArray']).toEqual([]);
    }

    if (actualAvroWithData['testSubType']['testMap'].length > 0) {
      actualAvroWithData['testSubType']['testMap'].entries((key, value) => {
        expect(key).toEqual('abc');
        expect(value).toEqual('abc');
      })
    } else {
      expect(actualAvroWithData['testSubType']['testMap']).toEqual([]);
    }
    expect(actualAvroWithData['testSubType']['testBytes']).toEqual('abc');
  });
});
