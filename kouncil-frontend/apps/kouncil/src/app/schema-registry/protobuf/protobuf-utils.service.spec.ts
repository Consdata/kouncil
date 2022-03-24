import {ProtobufUtilsService} from './protobuf-utils.service';
import expectedProtobufWithData from './expectedProtobufWithData.json';

const testProtobufSchema = `
  syntax = "proto3";
  package test;

  message Test {
    string stringTest = 1;
    repeated int32 intTest = 2;
    bool booleanTest = 3;
    bytes bytesTest = 4;
    double doubleTest = 5;
    Test1 test1 = 6;
  }

  message Test1 {
    string stringTest1 = 1;
    repeated Test2 test2 = 2;
  }

  message Test2 {
    double doubleTest2 = 1;
  }
`;

describe('ProtobufUtilsService', () => {
  const service: ProtobufUtilsService = new ProtobufUtilsService();

  it('should fill protobuf schema with proper data', () => {
    service['getRandomInt'] = () => 123;
    service['getRandomFloat'] = () => 123.123;
    service['getRandomString'] = () => 'abc';
    const actualProtobufWithData = service.fillProtobufSchemaWithData(testProtobufSchema);
    expect(JSON.stringify(actualProtobufWithData)).toEqual(JSON.stringify(expectedProtobufWithData));
  });
});
