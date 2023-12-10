export interface SurveyAnswer {
  sentId: string;
  result: SurveyResultValue;
  status: SurveyResultStatus;
  position: string;
}

export interface SurveyResultValue {
  questions?: SurveyQuestionResult[];
}

export interface SurveyQuestionResult {
  questionId: number;
  value: string;
  answer: string;
}

export enum SurveyResultStatus {
  FILLED = 'FILLED',
  DISCARDED = 'DISCARDED',
  PENDING = 'PENDING'
}
