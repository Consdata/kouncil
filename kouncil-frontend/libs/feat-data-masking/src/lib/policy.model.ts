export class Policy {

  constructor(public name: string, public type: MaskingType, public fields: Array<string>) {
  }
}

export enum MaskingType {
  ALL = 'ALL',
  FIRST_5 = 'FIRST_5',
  LAST_5 = 'LAST_5'
}
