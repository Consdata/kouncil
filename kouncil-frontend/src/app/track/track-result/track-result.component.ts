import {Component, OnInit, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {SearchService} from '../../search.service';
import {Title} from '@angular/platform-browser';
import {ProgressBarService} from '../../util/progress-bar.service';
import {DrawerService} from '../../util/drawer.service';
import {ServersService} from '../../servers.service';
import {MessageViewComponent} from '../../topic/message/message-view.component';
import {TrackService} from '../track.service';

@Component({
  selector: 'app-track-result',
  templateUrl: './track-result.component.html',
  styleUrls: ['./track-result.component.scss']
})
export class TrackResultComponent implements OnInit {
  filteredRows = [];
  allRows = [];
  searchSubscription: Subscription;
  @ViewChild('table') table: any;
  phrase: string;
  constructor(private route: ActivatedRoute,
              private searchService: SearchService,
              private titleService: Title,
              private progressBarService: ProgressBarService,
              private trackService: TrackService,
              private drawerService: DrawerService,
              private servers: ServersService) { }

  ngOnInit(): void {
    this.progressBarService.setProgress(true);
    this.searchSubscription = this.searchService.getState().subscribe(
      phrase => {
        this.phrase = phrase;
        this.filterRows();
      });
    this.allRows = this.trackService.getEvents();
    this.filterRows();
    this.progressBarService.setProgress(false);
  }

  showMessage(event): void {
    if (event.type === 'click') {
      this.drawerService.openDrawerWithPadding(MessageViewComponent, {
        source: event.row.value,
        headers: event.row.headers,
        key: event.row.key,
        topicName: event.row.topic
      });
    }
  }

  private filterRows() {
    this.filteredRows = this.allRows.filter((row) => {
      return !this.phrase || JSON.stringify(row).toLowerCase().indexOf(this.phrase.toLowerCase()) > -1;
    });
  }

  isLoading(): boolean {
    return this.progressBarService.progressSub.getValue();
  }

}
