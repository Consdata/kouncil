import { TestBed } from '@angular/core/testing';

import { ProtobufUtilsService } from './protobuf-utils.service';
import expectedProtobufWithData from './expectedProtobufWithData.json';

const testProtobufSchema = 'syntax = "proto3";package test;message Test {string stringTest = 1;repeated int32 intT' +
  'est = 2;bool booleanTest = 3;bytes bytesTest = 4;double doubleTest = 5;Test1 test1 = 6;}message Test1 {string st' +
  'ringTest1 = 1;repeated Test2 test2 = 2;}message Test2 {double doubleTest2 = 1;}';

describe('ProtobufUtilsService', () => {
  let service: ProtobufUtilsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProtobufUtilsService);
  });

  it('should fill protobuf schema with proper data', () => {
    spyOn<any>(service, 'getRandomInt').and.returnValue(123);
    spyOn<any>(service, 'getRandomFloat').and.returnValue(123.123);
    spyOn<any>(service, 'getRandomString').and.returnValue('abc');
    const actualProtobufWithData = service.fillProtobufSchemaWithData(testProtobufSchema);
    expect(JSON.stringify(actualProtobufWithData)).toEqual(JSON.stringify(expectedProtobufWithData));
  });
});
