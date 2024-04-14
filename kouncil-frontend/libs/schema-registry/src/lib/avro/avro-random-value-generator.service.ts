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

  public readonly typeFunctionMap: Map<string, string | number | boolean | null> =
    new Map<string, string | number | boolean | null>([
      ['int', this.intGeneratorService.getRandomInt()],
      ['long', this.intGeneratorService.getRandomInt()],
      ['double', this.floatGeneratorService.getRandomFloat()],
      ['float', this.floatGeneratorService.getRandomFloat()],
      ['decimal', this.floatGeneratorService.getRandomFloat()],
      ['string', this.stringGeneratorService.getRandomString()],
      ['fixed', this.stringGeneratorService.getRandomString()],
      ['date', Math.floor(this.dateGeneratorService.getRandomDate() / 8.64e7)],
      ['time', this.dateGeneratorService.getTimeSinceMidnight()],
      ['time-millis', this.dateGeneratorService.getTimeSinceMidnight()],
      ['time-micros', this.dateGeneratorService.getTimeSinceMidnight() * 1000],
      ['timestamp-micros', this.dateGeneratorService.getRandomDate() * 1000],
      ['local-timestamp-micros', this.dateGeneratorService.getRandomDate() * 1000],
      ['timestamp-millis', this.dateGeneratorService.getRandomDate()],
      ['local-timestamp-millis', this.dateGeneratorService.getRandomDate()],
      ['bytes', this.bytesGeneratorService.getRandomBytes()],
      ['null', null],
      ['boolean', this.booleanGeneratorService.getRandomBoolean()],
      ['uuid', this.uuidGeneratorService.getRandomUUID()]
    ]);

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
}
