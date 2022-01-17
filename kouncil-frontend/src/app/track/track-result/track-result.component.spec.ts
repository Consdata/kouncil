import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TrackResultComponent } from './track-result.component';
import { RouterTestingModule } from '@angular/router/testing';
import { SearchService } from '../../search.service';
import { MatDialog } from '@angular/material/dialog';
import { ServersService } from '../../servers.service';
import { RxStompService } from '@stomp/ng2-stompjs';
import { TrackService } from '../track.service';

describe('TrackResultComponent', () => {
  let component: TrackResultComponent;
  let fixture: ComponentFixture<TrackResultComponent>;
  let mockTrackService;

  beforeEach(waitForAsync(() => {
    mockTrackService = jasmine.createSpyObj(['isAsyncEnable'])
    mockTrackService.isAsyncEnable.and.returnValue(false);
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      providers: [
        { provide: MatDialog, useValue: {} },
        { provide: TrackService, useValue: mockTrackService },
        SearchService,
        ServersService,
        RxStompService

      ],
      declarations: [ TrackResultComponent ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrackResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
