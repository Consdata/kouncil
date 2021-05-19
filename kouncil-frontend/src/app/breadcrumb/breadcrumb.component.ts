import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent implements OnInit {

  @Input() parentLink: string;

  @Input() parentName: string;

  @Input() name: string;

  constructor() {
  }

  ngOnInit(): void {
  }

}
