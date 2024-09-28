export class Policy {

  constructor(public name: string, public type: MaskingType, public fields: Array<string>) {
  }
}

export enum MaskingType {
  ALL = 'Hide all',
  FIRST_5 = 'Hide first 5 signs',
  LAST_5 = 'Hide last 5 signs'
}
