import {Injectable} from '@angular/core';
import {
  EnumType,
  Field,
  isArrayType,
  isEnumType,
  isLogicalType,
  isMapType,
  isRecordType,
  RecordType
} from "avro-typescript";
import {
  ArrayType,
  BaseType,
  isUnion,
  LogicalType,
  MapType,
  NamedType
} from "avro-typescript/lib/model";

@Injectable({
  providedIn: 'root'
})
export class AvroUtilsService {

  private readonly MIN_RANDOM_NUMBER: number = 1;
  private readonly MAX_RANDOM_NUMBER: number = 1000;

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

  public fillAvroSchemaWithData(avroSchema: string): object {
    const schema = JSON.parse(avroSchema) as RecordType;
    let example = {};
    schema.fields.forEach(field => {
      this.processField(field, example);
    });
    return example;
  }

  private getRandomValueBasedOnType(type: string): number | string | boolean | null | Date | ArrayBuffer {
    if (this.INTEGER_TYPES.includes(type)) {
      return this.getRandomInt();
    }
    if (this.NUMBER_TYPES.includes(type)) {
      return this.getRandomFloat();
    }
    if (this.DECIMAL_TYPE === type) {
      return this.getRandomFloat();
    }
    if (this.STRING_TYPES.includes(type)) {
      return this.getRandomString();
    }
    if (this.BYTE_TYPE === type) {
      return this.getRandomBytes();
    }
    if (this.BOOLEAN_TYPE === type) {
      return this.getRandomBoolean();
    }
    if (this.NULL_TYPE === type) {
      return null;
    }
    if (this.DATE_TYPE === type) {
      return Math.floor(this.getRandomDate() / 8.64e7);
    }
    if (this.TIME_TYPES.includes(type)) {
      return this.getTimeSinceMidnight();
    }
    if (this.TIMEMICROS_TYPES === type) {
      return this.getTimeSinceMidnight() * 1000;
    }
    if (this.TIMESTAMP_MICROS_TYPES.includes(type)) {
      return this.getRandomDate() * 1000;
    }
    if (this.TIMESTAMP_TYPES.includes(type)) {
      return this.getRandomDate();
    }
    if (this.UUID_TYPE === type) {
      return this.getRandomUUID();
    }

    return type;
  }

  private getRandomUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0,
        v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  private getRandomDate(): number {
    return new Date(+new Date() - Math.random() * (1e+12)).getTime();
  }

  private getTimeSinceMidnight(): number {
    let date = this.getRandomDate();
    let midnight = new Date(date).setHours(0, 0, 0, 0)
    return date - midnight
  }

  private getRandomInt(): number {
    return Math.floor(Math.random() * (this.MAX_RANDOM_NUMBER - this.MIN_RANDOM_NUMBER + 1)) + this.MIN_RANDOM_NUMBER;
  }

  private getRandomFloat(): number {
    return Math.random() * (this.MAX_RANDOM_NUMBER - this.MIN_RANDOM_NUMBER) + this.MIN_RANDOM_NUMBER;
  }

  private getRandomString(): string {
    return (Math.random() + 1).toString(36).substring(7);
  }

  private getRandomBoolean(): boolean {
    return this.getRandomInt() % 2 === 0;
  }

  private getRandomBytes(): string {
    return this.getRandomString();
  }

  private processField(field: Field, example: object) {
    if (isRecordType(field.type as BaseType)) {
      // record type
      let subExample = {};
      (field.type as RecordType).fields.forEach(field => {
        this.processField(field, subExample);
      });
      example[field.name] = subExample;
    } else if (isArrayType(field.type as BaseType)) {
      // array type
      example[field.name] = Array.from({length: Math.floor(Math.random() * 10)},
        () => this.getRandomValueBasedOnType((field.type as ArrayType).items.toString()));
    } else if (isMapType(field.type as BaseType)) {
      // map type
      example[field.name] = Array.from({length: Math.floor(Math.random() * 10)},
        () => [
          this.getRandomString(),
          this.getRandomValueBasedOnType((field.type as MapType).values.toString())
        ]);
    } else if (isEnumType(field.type as BaseType)) {
      // enum type
      let symbols = (field.type as EnumType).symbols;
      let number = Math.floor(Math.random() * symbols.length);
      example[field.name] = symbols[number];
    } else if (isUnion(field.type as BaseType)) {
      // union type
      let type = field.type as NamedType[];
      let number = Math.floor(Math.random() * type.length);
      example[field.name] = this.getRandomValueBasedOnType(type[number].toString())
    } else if (isLogicalType(field.type as BaseType)) {
      // logical type
      const logicalType = field.type as LogicalType
      let randomValueBasedOnType = this.getRandomValueBasedOnType(logicalType.logicalType);
      if (this.DECIMAL_TYPE === logicalType.logicalType) {
        randomValueBasedOnType = (+(randomValueBasedOnType as number)
        .toFixed(logicalType['scale']))
        .toPrecision(logicalType['precision'])
        .padEnd(logicalType['precision'], '0').replace(".", "");
        const hex = (+randomValueBasedOnType).toString(16);
        let hexValue = '';
        hex.match(/..?/g).forEach(value => hexValue += '\\u00'+value.padStart(2, '0'));
        randomValueBasedOnType = hexValue
      }

      example[field.name] = randomValueBasedOnType;
    } else {
      // basic type
      example[field.name] = this.getRandomValueBasedOnType(field.type.toString());
    }
  }
}
