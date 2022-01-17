import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackFilterComponent } from './track-filter.component';
import { ServersService } from '../../servers.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EnumToArrayPipe } from './enum-to-array.pipe';
import { TrackService } from '../track.service';
import { TopicsService } from '../../topics/topics.service';

describe('TrackFilterComponent', () => {
  let component: TrackFilterComponent;
  let fixture: ComponentFixture<TrackFilterComponent>;

  let trackServiceMock = {
    subscribe: () => {}
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule
      ],
      providers: [
        ServersService,
        { provide: TrackService, useValue: trackServiceMock },
        TopicsService
      ],
      declarations: [
        TrackFilterComponent,
        EnumToArrayPipe
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TrackFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
