export interface Clusters {
  clusters: ClusterMetadata[];
}

export class ClusterMetadata {

  constructor(public id: number, public name: string, public brokers: Array<ClusterBroker>,
              public clusterSecurityConfig: ClusterSecurityConfig,
              public globalJmxUser: string, public globalJmxPort: string, public globalJmxPassword: string,
              public schemaRegistry: SchemaRegistry) {
  }
}

export class ClusterBroker {
  constructor(public id: number, public bootstrapServer: string, public jmxUser: string, public jmxPassword: string,
              public jmxPort: number) {
  }
}

export class ClusterSecurityConfig {
  constructor(public authenticationMethod?: ClusterAuthenticationMethod,
              public securityProtocol?: ClusterSecurityProtocol,
              public saslMechanism?: ClusterSASLMechanism,
              public truststoreLocation?: string,
              public truststorePassword?: string,
              public keystoreLocation?: string,
              public keystorePassword?: string,
              public keyPassword?: string,
              public awsProfileName?: string,
              public username?: string,
              public password?: string) {
  }
}

export class SchemaRegistry {
  constructor(public id: number, public url: string, public schemaRegistrySecurityConfig: SchemaRegistrySecurityConfig) {
  }
}

export class SchemaRegistrySecurityConfig {
  constructor(public authenticationMethod: SchemaAuthenticationMethod,
              public keystoreLocation: string,
              public keystorePassword: string,
              public keystoreType: StoreType,
              public keyPassword: string,
              public truststoreLocation: string,
              public truststorePassword: string,
              public truststoreType: StoreType,
              public username: string,
              public password: string) {
  }
}

export enum ClusterAuthenticationMethod {
  NONE = 'None',
  SASL = 'SASL',
  SSL = 'SSL',
  AWS_MSK = 'AWS MSK'
}

export enum ClusterSecurityProtocol {
  SASL_PLAINTEXT = 'SASL plaintext',
  SASL_SSL = 'SASL SSL'
}

export enum ClusterSASLMechanism {
  PLAIN = 'Plain'
}

export enum SchemaAuthenticationMethod {
  NONE = 'None',
  SSL = 'SSL',
  SSL_BASIC_AUTH = 'SSL with basic auth'
}

export enum StoreType {
  JKS = 'JKS'
}
