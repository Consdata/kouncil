import {SystemFunctionName} from '@app/common-auth';

export class UserGroup {

  constructor(public id: number, public name: string, public code: string, public functions: Array<SystemFunction>) {
  }
}

export class SystemFunction {

  constructor(public id: number, public name: SystemFunctionName, public label: string, public functionGroup: FunctionGroup) {
  }
}

export enum FunctionGroup {

  TOPIC = 'TOPIC',
  CONSUMER_GROUP = 'CONSUMER_GROUP',
  SCHEMA_REGISTRY = 'SCHEMA_REGISTRY',
  CLUSTER = 'CLUSTER',
  ADMIN = 'ADMIN',
  DATA_MASKING = 'DATA_MASKING'
}
