export interface Broker {
  id: string;
  host: string;
  port: number;
  rack: string;
  config?: BrokerConfig[] | null;
  jmxStats: boolean;
  system?: string;
  availableProcessors?: number;
  systemLoadAverage?: number;
  freeMem?: number;
  totalMem?: number;
}

export interface BrokerConfig {
  name: string;
  value?: string | undefined | null;
  source: string;
  isSensitive: boolean;
  isReadOnly: boolean;
}

