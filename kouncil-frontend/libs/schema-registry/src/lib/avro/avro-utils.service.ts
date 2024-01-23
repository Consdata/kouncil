import {Injectable} from '@angular/core';
import {
  EnumType,
  Field,
  isArrayType,
  isEnumType,
  isMapType,
  isRecordType,
  RecordType
} from "avro-typescript";
import {ArrayType, BaseType, isUnion, MapType, NamedType} from "avro-typescript/lib/model";

@Injectable({
  providedIn: 'root'
})
export class AvroUtilsService {

  private readonly MIN_RANDOM_NUMBER: number = 1;
  private readonly MAX_RANDOM_NUMBER: number = 1000;

  private readonly INTEGER_TYPES: string[] = ['int', 'long'];
  private readonly NUMBER_TYPES: string[] = ['double', 'float'];
  private readonly STRING_TYPES: string[] = ['string', 'fixed'];
  private readonly BYTE_TYPE: string = 'bytes';
  private readonly NULL_TYPE: string = 'null';
  private readonly BOOLEAN_TYPE: string = 'boolean';

  public fillAvroSchemaWithData(avroSchema: string): object {
    const schema = JSON.parse(avroSchema) as RecordType;
    let example = {};
    schema.fields.forEach(field => {
      this.processField(field, example);
    });
    return example;
  }

  private getRandomValueBasedOnType(type: string): number | string | boolean | null {
    if (this.INTEGER_TYPES.includes(type)) {
      return this.getRandomInt();
    }
    if (this.NUMBER_TYPES.includes(type)) {
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

    return type;
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
    } else {
      // basic type
      example[field.name] = this.getRandomValueBasedOnType(field.type.toString());
    }
  }
}
