import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';
import {SurveyQuestion} from '../model/survey.model';

@Component({
  selector: 'app-survey-scale-question',
  template: `

    <div class="survey-frame">
      <div class="survey-base"
           [ngClass]="{'survey-base-with-response': isInRange()}">
        <div class="survey-container">
          <div class=survey-title *ngIf="question">
            {{question.title}}
          </div>
          <div class="survey-scale"
               [ngClass]="{'full-width': questionValues.length > 6, 'fixed-width': questionValues.length < 7}">
            <div class="survey-scale-text" *ngIf="question">
              <span>{{question.prefixLabelText}}</span>
              <span>{{question.suffixLabelText}}</span>
            </div>
            <div class="survey-scale-buttons">
              <button *ngFor="let value of questionValues" type="button" class="scale-button"
                      (click)="selectedValue = value"
                      [ngClass]="{'selected-button-value': selectedValue === value}">
                {{value}}
              </button>
            </div>
          </div>
        </div>
        <div class="survey-form" *ngIf="isInRange()">
          <span
            style="font-size: 12px;">{{question.questionWhenSelected}}</span>
          <textarea style="outline: none" rows="5" [(ngModel)]="reason"
                    name="value"></textarea>
        </div>
      </div>
    </div>

  `,
  styleUrls: ['./survey-scale-question.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SurveyScaleQuestionComponent implements OnInit {

  @Input() question: SurveyQuestion;
  selectedValue: number;
  reason: string;

  questionValues: Array<number>;

  constructor() {
  }

  ngOnInit(): void {
    this.questionValues = Array.from(
      Array(this.question.range.end - this.question.range.start + 1),
      (_, index) => index + this.question.range.start
    );
  }

  isInRange(): boolean {
    return this.selectedValue >= this.question.questionWhenSelectedRange.start
      && this.selectedValue <= this.question.questionWhenSelectedRange.end;
  }
}
