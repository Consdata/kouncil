export class TrackFilter {
  constructor(public field: string,
              public operator: TrackOperator,
              public value: string,
              public startDateTime: string,
              public stopDateTime: string,
              public topics: string[]) {
  }
}

/* eslint-disable @typescript-eslint/naming-convention */
export enum TrackOperator {
  '~',
  '!~',
  'is',
  'is not',
  'regex'
}

/* eslint-enable */
