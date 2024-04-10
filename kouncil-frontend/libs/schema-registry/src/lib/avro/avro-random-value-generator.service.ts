import {Injectable} from '@angular/core';
import {RandomIntGeneratorService} from '../generators/random-int-generator.service';
import {RandomFloatGeneratorService} from '../generators/random-float-generator.service';
import {RandomStringGeneratorService} from '../generators/random-string-generator.service';
import {RandomBytesGeneratorService} from '../generators/random-bytes-generator.service';
import {RandomBooleanGeneratorService} from '../generators/random-boolean-generator.service';
import {RandomDateGeneratorService} from '../generators/random-date-generator.service';
import {RandomUuidGeneratorService} from '../generators/random-uuid-generator.service';

@Injectable({
  providedIn: 'root'
})
export class AvroRandomValueGeneratorService {

  private readonly INTEGER_TYPES: string[] = ['int', 'long'];
  private readonly NUMBER_TYPES: string[] = ['double', 'float'];
  private readonly DECIMAL_TYPE: string = 'decimal';
  private readonly STRING_TYPES: string[] = ['string', 'fixed'];
  private readonly DATE_TYPE: string = 'date';
  private readonly TIME_TYPES: string[] = ['time', 'time-millis'];
  private readonly TIMEMICROS_TYPES: string = 'time-micros';
  private readonly TIMESTAMP_MICROS_TYPES: string[] = ['timestamp-micros', 'local-timestamp-micros'];
  private readonly TIMESTAMP_TYPES: string[] = ['timestamp-millis', 'local-timestamp-millis'];
  private readonly BYTE_TYPE: string = 'bytes';
  private readonly NULL_TYPE: string = 'null';
  private readonly BOOLEAN_TYPE: string = 'boolean';
  private readonly UUID_TYPE: string = 'uuid';

  constructor(
    private intGeneratorService: RandomIntGeneratorService,
    private floatGeneratorService: RandomFloatGeneratorService,
    private stringGeneratorService: RandomStringGeneratorService,
    private bytesGeneratorService: RandomBytesGeneratorService,
    private booleanGeneratorService: RandomBooleanGeneratorService,
    private dateGeneratorService: RandomDateGeneratorService,
    private uuidGeneratorService: RandomUuidGeneratorService,
  ) {
  }

  public getRandomValueBasedOnType(type: string): number | string | boolean | null {
    if (this.INTEGER_TYPES.includes(type)) {
      return this.intGeneratorService.getRandomInt();
    }
    if (this.NUMBER_TYPES.includes(type)) {
      return this.floatGeneratorService.getRandomFloat();
    }
    if (this.DECIMAL_TYPE === type) {
      return this.floatGeneratorService.getRandomFloat();
    }
    if (this.STRING_TYPES.includes(type)) {
      return this.stringGeneratorService.getRandomString();
    }
    if (this.BYTE_TYPE === type) {
      return this.bytesGeneratorService.getRandomBytes();
    }
    if (this.BOOLEAN_TYPE === type) {
      return this.booleanGeneratorService.getRandomBoolean();
    }
    if (this.NULL_TYPE === type) {
      return null;
    }
    if (this.DATE_TYPE === type) {
      return Math.floor(this.dateGeneratorService.getRandomDate() / 8.64e7);
    }
    if (this.TIME_TYPES.includes(type)) {
      return this.dateGeneratorService.getTimeSinceMidnight();
    }
    if (this.TIMEMICROS_TYPES === type) {
      return this.dateGeneratorService.getTimeSinceMidnight() * 1000;
    }
    if (this.TIMESTAMP_MICROS_TYPES.includes(type)) {
      return this.dateGeneratorService.getRandomDate() * 1000;
    }
    if (this.TIMESTAMP_TYPES.includes(type)) {
      return this.dateGeneratorService.getRandomDate();
    }
    if (this.UUID_TYPE === type) {
      return this.uuidGeneratorService.getRandomUUID();
    }

    return type;
  }
}
