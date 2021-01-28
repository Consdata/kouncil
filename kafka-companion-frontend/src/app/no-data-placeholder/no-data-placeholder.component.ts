import { Component, OnInit } from '@angular/core';
import {ProgressBarService} from "../util/progress-bar.service";

@Component({
  selector: 'app-no-data-placeholder',
  templateUrl: './no-data-placeholder.component.html',
  styleUrls: ['./no-data-placeholder.component.scss']
})
export class NoDataPlaceholderComponent implements OnInit {

  constructor(private progressBarService: ProgressBarService) { }

  ngOnInit(): void {
  }

}
