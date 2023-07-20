import {MessageFormat} from './message-format';
import {SubjectType} from "./subject-type";
import {Compatibility} from "./compatibility";

export interface Schema {
  messageFormat: MessageFormat;
  plainTextSchema: string;
  topicName: string;
  subjectName: string;
  version: number;
  subjectType: SubjectType;
  versionsNo: Array<number>;
  compatibility: Compatibility;
}
