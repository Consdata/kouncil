import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef, Input, OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {filter, mergeMap, Observable, Subscription} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {Backend} from '@app/common-model';
import {ProgressBarService, SearchService} from '@app/common-utils';
import {ServersService} from '@app/common-servers';
import {AuthService, SystemFunctionName} from '@app/common-auth';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-kafka-navbar',
  template: `
    <mat-toolbar>
      <img src="assets/kouncil-logo.png" alt="logo" class="kouncil-logo"
           matTooltip="{{backendVersion$ | async}}"/>

      <mat-divider [vertical]="true"></mat-divider>

      <button class="menu-button" mat-button [disableRipple]="true" (click)=goToGithub()>
        Documentation
        <mat-icon class="material-symbols-outlined" aria-hidden="false">open_in_new</mat-icon>
      </button>

      <span class="spacer"></span>

      <div class="search" *ngIf="(isAuthenticated$ | async) && !hideForAuthenticated">
        <input accesskey="/"
               class="search-input"
               type="text"
               placeholder="Search"
               (input)="onPhraseChange($any($event).target.value)"
               [(ngModel)]="searchService.currentPhrase"
               #searchInput>
      </div>
      <mat-form-field class="servers-form-field" [appearance]="'outline'"
                      *ngIf="(isAuthenticated$ | async) && !hideForAuthenticated && !hideClusterContext">
        <mat-select panelClass="servers-list"
                    class="select servers"
                    [(value)]="servers.selectedServerId"
                    (selectionChange)="serverSelectionChanged()">
          <mat-option *ngFor="let s of servers.servers$ | async" value="{{s.serverId}}">
            {{ s.serverId }} - {{ s.label }}
          </mat-option>
        </mat-select>
      </mat-form-field>

      <app-notification-button></app-notification-button>

      <button *ngIf="(isAuthenticated$ | async) && !hideForAuthenticated" class="menu-button"
              mat-button [disableRipple]="true"
              (click)="logout()">
        Logout
        <mat-icon class="material-symbols-outlined" aria-hidden="false">logout</mat-icon>
      </button>

      <img *ngIf="!((isAuthenticated$ | async) && !hideForAuthenticated)"
           src="assets/consdata-logo-color.png" alt="logo"
           class="consdata-logo"/>
    </mat-toolbar>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('searchInput', {static: true}) private searchInputElementRef?: ElementRef;

  @Input() hideForAuthenticated: boolean = false;

  SystemFunctionName: typeof SystemFunctionName = SystemFunctionName;

  backendVersion$?: Observable<string>;
  isAuthenticated$: Observable<boolean> = this.authService.isAuthenticated$;
  hideClusterContext: boolean = false;
  subscriptions: Subscription = new Subscription();

  constructor(public searchService: SearchService,
              private router: Router,
              private http: HttpClient,
              public servers: ServersService,
              public authService: AuthService,
              private progressBarService: ProgressBarService) {
    this.subscriptions.add(router.events.subscribe(() => {
      this.searchInputElementRef?.nativeElement.focus();
    }));

    this.subscriptions.add(router.events.pipe(filter(event => event instanceof NavigationEnd))
    .pipe(
      mergeMap(() => this.getRoute(this.router.routerState.root).data),
      map(data => data['hideClusterContext'] ? data['hideClusterContext'] : false)
    ).subscribe(result => {
      this.hideClusterContext = result;
    }));

  }

  private getRoute(route: ActivatedRoute): ActivatedRoute {
    return route.firstChild ? this.getRoute(route.firstChild) : route;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public serverSelectionChanged(): void {
    localStorage.setItem('lastSelectedServer', this.servers.getSelectedServerId());
    this.router.navigate([this.router.url]);
  }

  public ngAfterViewInit(): void {
    this.searchInputElementRef?.nativeElement.focus();
  }

  ngOnInit(): void {
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

  onPhraseChange(phrase: string): void {
    this.searchService.phraseChangeHandle(phrase);
  }

  goToGithub(): void {
    window.open('https://github.com/consdata/kouncil', '_blank');
  }

  logout(): void {
    this.authService.logout$().subscribe(() => {
      this.progressBarService.setProgress(false);
      this.router.navigate(['/login']);
    });
  }
}
