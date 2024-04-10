import {Injectable} from '@angular/core';
import {
  EnumType,
  Field,
  isArrayType,
  isEnumType,
  isMapType,
  isRecordType,
  RecordType
} from 'avro-typescript';
import {ArrayType, BaseType, isUnion, MapType, NamedType} from 'avro-typescript/lib/model';
import {AvroRandomValueGeneratorService} from './avro-random-value-generator.service';

@Injectable({
  providedIn: 'root'
})
export class AvroUtilsService {

  constructor(private randomValueGeneratorService: AvroRandomValueGeneratorService) {
  }

  public fillAvroSchemaWithData(avroSchema: string): object {
    const schema = JSON.parse(avroSchema) as RecordType;
    const example = {};
    schema.fields.forEach(field => {
      this.processField(field, example);
    });
    return example;
  }

  private processField(field: Field, example: object) {
    if (isRecordType(field.type as BaseType)) {
      // record type
      const subExample = {};
      (field.type as RecordType).fields.forEach(subField => {
        this.processField(subField, subExample);
      });
      example[field.name] = subExample;
    } else if (isArrayType(field.type as BaseType)) {
      // array type
      example[field.name] = Array.from({length: Math.floor(Math.random() * 10)},
        () => this.randomValueGeneratorService.getRandomValueBasedOnType((field.type as ArrayType).items.toString()));
    } else if (isMapType(field.type as BaseType)) {
      // map type
      example[field.name] = Array.from({length: Math.floor(Math.random() * 10)},
        () => [
          this.randomValueGeneratorService.getRandomValueBasedOnType('string'),
          this.randomValueGeneratorService.getRandomValueBasedOnType((field.type as MapType).values.toString())
        ]);
    } else if (isEnumType(field.type as BaseType)) {
      // enum type
      const symbols = (field.type as EnumType).symbols;
      const number = Math.floor(Math.random() * symbols.length);
      example[field.name] = symbols[number];
    } else if (isUnion(field.type as BaseType)) {
      // union type
      const type = field.type as NamedType[];
      const number = Math.floor(Math.random() * type.length);
      example[field.name] = this.randomValueGeneratorService.getRandomValueBasedOnType(type[number].toString());
    } else {
      // basic type
      example[field.name] = this.randomValueGeneratorService.getRandomValueBasedOnType(field.type.toString());
    }
  }
}
