export class TrackFilter {
  constructor(public field: string,
              public value: string,
              public startDateTime: string,
              public stopDateTime: string,
              public topics: String[]) {
  }
}
