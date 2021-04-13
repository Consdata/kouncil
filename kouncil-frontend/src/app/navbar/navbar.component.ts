import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { SearchService } from "app/search.service";
import { Router } from "@angular/router";

@Component({
  selector: 'kafka-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  @ViewChild('searchInput', { static: true }) private searchInputElementRef: ElementRef;

  phrase: string;

  constructor(private searchService: SearchService, private router: Router) {
    router.events.subscribe((val) => {
      this.searchInputElementRef.nativeElement.value = "";
      this.searchInputElementRef.nativeElement.focus();
    });
  }

  public ngAfterViewInit(): void {
    this.searchInputElementRef.nativeElement.focus();
  }

  ngOnInit() {
  }

  onPhraseChange(phrase: string) {
    this.searchService.setState(phrase);
  }
}
