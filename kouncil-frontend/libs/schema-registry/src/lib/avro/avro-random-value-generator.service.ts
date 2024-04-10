import {Injectable} from '@angular/core';
import {RandomIntGeneratorService} from '../generators/random-int-generator.service';
import {RandomFloatGeneratorService} from '../generators/random-float-generator.service';
import {RandomStringGeneratorService} from '../generators/random-string-generator.service';
import {RandomBytesGeneratorService} from '../generators/random-bytes-generator.service';
import {RandomBooleanGeneratorService} from '../generators/random-boolean-generator.service';

@Injectable({
  providedIn: 'root'
})
export class AvroRandomValueGeneratorService {

  private readonly INTEGER_TYPES: string[] = ['int', 'long'];
  private readonly NUMBER_TYPES: string[] = ['double', 'float'];
  private readonly STRING_TYPES: string[] = ['string', 'fixed'];
  private readonly BYTE_TYPE: string = 'bytes';
  private readonly NULL_TYPE: string = 'null';
  private readonly BOOLEAN_TYPE: string = 'boolean';

  constructor(
    private intGeneratorService: RandomIntGeneratorService,
    private floatGeneratorService: RandomFloatGeneratorService,
    private stringGeneratorService: RandomStringGeneratorService,
    private bytesGeneratorService: RandomBytesGeneratorService,
    private booleanGeneratorService: RandomBooleanGeneratorService,
  ) {
  }

  public getRandomValueBasedOnType(type: string): number | string | boolean | null {
    if (this.INTEGER_TYPES.includes(type)) {
      return this.intGeneratorService.getRandomInt();
    }
    if (this.NUMBER_TYPES.includes(type)) {
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

    return type;
  }
}
