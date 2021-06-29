import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {SearchService} from 'app/search.service';
import {Router} from '@angular/router';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {Backend} from '../app.backend';
import {ServersService} from '../servers.service';

@Component({
  selector: 'app-kafka-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, AfterViewInit {

  @ViewChild('searchInput', {static: true}) private searchInputElementRef: ElementRef;

  phrase: string;
  backendVersion$: Observable<string>;

  constructor(private searchService: SearchService,
              private router: Router,
              private http: HttpClient,
              public servers: ServersService) {
    router.events.subscribe((val) => {
      this.searchInputElementRef.nativeElement.value = '';
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
        this.backendVersion$ = new Observable( observer => observer.next('DEMO'));
        break;
      }
    }
  }

  onPhraseChange(phrase: string) {
    this.searchService.setState(phrase);
  }
}
