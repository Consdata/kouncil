export class Policy {

  constructor(public id: number, public name: string, public maskingType: MaskingType,
              public applyToAllResources: boolean, public fields: Array<PolicyField>,
              public resources: Array<PolicyResource>) {
  }
}

export class PolicyResource {
  constructor(public id: number, public cluster: number, public topic: string) {
  }
}

export class PolicyField {

  constructor(public id: number, public findRule: FindRule, public field: string) {
  }
}


export enum MaskingType {
  ALL = 'Hide all',
  FIRST_5 = 'Hide first 5 signs',
  LAST_5 = 'Hide last 5 signs'
}

export enum FindRule {
  ANY_LEVEL = 'Find at any level',
  EXACT_PATH = 'Find field at this level'
}
