export class Policy {

  constructor(public id: number, public name: string,
              public applyToAllResources: boolean, public fields: Array<PolicyField>,
              public resources: Array<PolicyResource>, public userGroups: Array<number>) {
  }
}

export class PolicyResource {
  constructor(public id: number, public cluster: number, public topic: string) {
  }
}

export class PolicyField {

  constructor(public id: number, public maskingType: MaskingType, public field: string) {
  }
}


export enum MaskingType {
  ALL = 'Hide all',
  FIRST_5 = 'Hide first 5 signs',
  LAST_5 = 'Hide last 5 signs'
}
