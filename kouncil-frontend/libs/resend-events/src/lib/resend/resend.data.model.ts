
export interface ResendDataModel {
  sourceTopicName: string;
  sourceTopicPartition: number;
  offsetBeginning: number;
  offsetEnd: number;
  destinationTopicName: string;
  destinationTopicPartition: number;
}
