import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {SearchService} from 'app/search.service';
import {Router} from '@angular/router';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {Globals} from '../globals';

export class Server {
  serverId: string;
  label: string;
}

@Component({
  selector: 'kafka-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, AfterViewInit {

  @ViewChild('searchInput', {static: true}) private searchInputElementRef: ElementRef;

  phrase: string;
  backendVersion$: Observable<string>;
  servers: Server[] = [];

  constructor(private searchService: SearchService, private router: Router, private http: HttpClient, public globals: Globals) {
    router.events.subscribe((val) => {
      this.searchInputElementRef.nativeElement.value = '';
      this.searchInputElementRef.nativeElement.focus();
    });
  }

  public ngAfterViewInit(): void {
    this.searchInputElementRef.nativeElement.focus();
  }

  ngOnInit() {
    this.backendVersion$ = this.http.get(`/api/info/version`, {responseType: 'text'});

    this.http.get(`/api/connection`).subscribe(
      value => {
        if (value != null) {
          for (const key in value) {
            const server = new Server();
            server.label = value[key];
            server.serverId = key;
            this.servers.push(server);
          }
          this.globals.selectedServer = this.servers[0];
        }
      }
    );

  }

  onPhraseChange(phrase: string) {
    this.searchService.setState(phrase);
  }
}
