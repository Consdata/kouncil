import {AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {SearchService} from 'app/search.service';
import {Router} from '@angular/router';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {Backend} from '../app.backend';
import {ServersService} from '../servers.service';

@Component({
  selector: 'app-kafka-navbar',
  template: `
    <mat-toolbar>
      <img *ngIf="backendVersion$ | async as backendVersion"
           src="assets/kouncil-logo.png" alt="logo" class="kouncil-logo"
           matTooltip="{{backendVersion}}"/>
      <a class="menu-button" mat-button disableRipple routerLinkActive="active" [routerLink]="['/topics']">Topics</a>
      <a class="menu-button" mat-button disableRipple routerLinkActive="active" [routerLink]="['/brokers']">Brokers</a>
      <a class="menu-button" mat-button disableRipple routerLinkActive="active" [routerLink]="['/consumer-groups']">Consumer
        Groups</a>
      <a class="menu-button" mat-button disableRipple routerLinkActive="active" [routerLink]="['/track']">Track</a>

      <mat-divider [vertical]="true"></mat-divider>

      <button class="menu-button" mat-button disableRipple (click)=goToGithub()>
        Documentation
        <mat-icon aria-hidden="false">open_in_new</mat-icon>
      </button>

      <span class="spacer"></span>

      <div class="search">
        <input
          accesskey="/"
          class="search-input"
          type="text"
          placeholder="Search"
          (input)="onPhraseChange($event.target.value)"
          [(ngModel)]="searchService.currentPhrase"
          #searchInput>
      </div>
      <mat-form-field class="servers-form-field">
        <mat-select
          panelClass="servers-list"
          class="select servers"
          [(value)]="servers.selectedServerId"
          (selectionChange)="serverSelectionChanged()">
          <mat-option *ngFor="let s of servers.getServers()" value="{{s.serverId}}">{{s.serverId}}
            - {{s.label}}</mat-option>
        </mat-select>
      </mat-form-field>
    </mat-toolbar>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, AfterViewInit {

  @ViewChild('searchInput', {static: true}) private searchInputElementRef: ElementRef;

  backendVersion$: Observable<string>;

  constructor(public searchService: SearchService,
              private router: Router,
              private http: HttpClient,
              public servers: ServersService) {
    router.events.subscribe(() => {
      this.searchInputElementRef.nativeElement.focus();
    });
  }

  public serverSelectionChanged() {
    localStorage.setItem('lastSelectedServer', this.servers.getSelectedServerId());
    this.router.navigate([this.router.url]);
  }

  public ngAfterViewInit(): void {
    this.searchInputElementRef.nativeElement.focus();
  }

  ngOnInit() {
    switch (environment.backend) {
      case Backend.SERVER: {
        this.backendVersion$ = this.http.get(`/api/info/version`, {responseType: 'text'});
        break;
      }
      case Backend.DEMO: {
        this.backendVersion$ = new Observable(observer => observer.next('DEMO'));
        break;
      }
    }
  }

  onPhraseChange(phrase: string) {
    this.searchService.phraseChangeHandle(phrase);
  }

  goToGithub() {
    window.open('https://github.com/consdata/kouncil', '_blank');
  }
}
