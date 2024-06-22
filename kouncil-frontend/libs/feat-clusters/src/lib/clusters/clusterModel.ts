export interface Clusters {
  clusters: ClusterMetadata[];
}

export class ClusterMetadata {

  constructor(public name: string) {
  }
}
