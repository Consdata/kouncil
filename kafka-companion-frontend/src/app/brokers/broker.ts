export class Broker {
  id: string;
  host: string;
  port: number;
  rack: string;
  config: BrokerConfig[];
}

export class BrokerConfig {
  name: string;
  value: string;
  source: string;
  isSensitive: boolean;
  isReadOnly: boolean;
}

