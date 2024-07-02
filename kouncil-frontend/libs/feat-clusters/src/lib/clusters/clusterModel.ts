export interface Clusters {
  clusters: ClusterMetadata[];
}

export class ClusterMetadata {

  constructor(public name: string, public brokers: Array<ClusterBroker>) {
  }
}

export class ClusterBroker {
  constructor(public bootstrapServer: string) {
  }
}
