export interface SurveyPending {
  readonly sentId: string;
  readonly surveyDefinition: SurveyDefinition;
  readonly description: string;
  readonly triggers: Array<SurveyTriggers>;
}

export interface SurveyDefinition {
  readonly id: number;
  readonly version: number;
  readonly identifier: string;
  readonly subject: string;
  readonly message: string;
  readonly design: string;
}

export interface SurveyQuestion {
  readonly id: number;
  readonly type: SurveyQuestionType;
  readonly title: string;
  readonly required: boolean;
  readonly submitted: boolean;
  readonly options: SurveyOption[];
  readonly prefixLabelText: string;
  readonly suffixLabelText: string;
  readonly questionWhenSelected: string;
  readonly range: SurveyQuestionRange;
  readonly questionWhenSelectedRange: SurveyQuestionRange;
}

export interface SurveyQuestionRange {
  readonly start: number;
  readonly end: number;
}

export interface SurveyOption {
  readonly id: number;
  readonly content: string;
}

export enum SurveyQuestionType {
  LINEAR_SCALE = 'LINEAR_SCALE'
}

export interface SurveyTriggers {
  readonly elementId: string;
}
