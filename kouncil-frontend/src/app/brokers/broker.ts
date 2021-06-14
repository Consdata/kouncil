export class Broker {
  id: string;
  host: string;
  port: number;
  rack: string;
  config: BrokerConfig[];
  jmxStats: boolean;
  system?: string;
  availableProcessors?: number;
  systemLoadAverage?: number;
  freeMem?: number;
  totalMem?: number;
}

export class BrokerConfig {
  name: string;
  value: string;
  source: string;
  isSensitive: boolean;
  isReadOnly: boolean;
}

