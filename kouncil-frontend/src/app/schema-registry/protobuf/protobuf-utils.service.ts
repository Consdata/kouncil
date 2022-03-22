import { Injectable } from '@angular/core';
import {parse, Type, ReflectionObject, Namespace, Field} from 'protobufjs';

export interface ProtobufSchemaFields {
  [key: string]: number | string | boolean | ProtobufSchemaFields;
}

@Injectable({
  providedIn: 'root'
})
export class ProtobufUtilsService {

  private readonly MIN_RANDOM_NUMBER = 1;
  private readonly MAX_RANDOM_NUMBER = 1000;
  private readonly INT_TYPES = ['int32', 'int64', 'uint32', 'uint64', 'sint32', 'sint64', 'fixed32', 'fixed64', 'sfixed32', 'sfixed64'];
  private readonly FLOAT_TYPES = ['double', 'float'];
  private readonly STRING_TYPE = 'string';
  private readonly BOOL_TYPE = 'bool';
  private readonly BYTES_TYPE = 'bytes';

  public fillProtobufSchemaWithData(protobufSchema: string): ProtobufSchemaFields {
    const root = parse(protobufSchema).root;
    const foundTypes = this.traverseTypes(root);
    return this.fillTypeWithData(foundTypes[0], foundTypes);
  }

  private traverseTypes(current: ReflectionObject): Type[] {
    let foundTypes: Type[] = [];
    if (current instanceof Type) {
      foundTypes.push(current);
    }

    if (current instanceof Namespace) {
      current.nestedArray.forEach((nested) => {
        foundTypes = [ ...foundTypes, ...this.traverseTypes(nested)];
      });
    }
    return foundTypes;
  }

  private fillTypeWithData(mainType: Type, foundTypes: Type[]): ProtobufSchemaFields {
    const typeWithData = {};
    mainType.fieldsArray.forEach((field: Field) => {
      if (field.repeated) {
        typeWithData[field.name] = [
          this.getRandomValueBasedOnType(field.type, foundTypes),
          this.getRandomValueBasedOnType(field.type, foundTypes)
        ];
      } else {
        typeWithData[field.name] = this.getRandomValueBasedOnType(field.type, foundTypes);
      }
    });
    return typeWithData;
  }

  private getRandomValueBasedOnType(type: string, foundTypes: Type[]): number | string | boolean | ProtobufSchemaFields {
    if (this.INT_TYPES.includes(type)) {
      return this.getRandomInt();
    }
    if (this.FLOAT_TYPES.includes(type)) {
      return this.getRandomFloat();
    }
    if (type === this.STRING_TYPE) {
      return this.getRandomString();
    }
    if (type === this.BOOL_TYPE) {
      return this.getRandomBoolean();
    }
    if (type === this.BYTES_TYPE) {
      return this.getRandomBytes();
    }

    const subType = this.getSubType(type, foundTypes);
    if (subType) {
      return this.fillTypeWithData(subType, foundTypes);
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

  private getSubType(type: string, foundTypes: Type[]): Type {
    return foundTypes.find((foundType: Type) => foundType.name === type);
  }
}
