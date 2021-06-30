import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackFilterComponent } from './track-filter.component';

describe('TrackFilterComponent', () => {
  let component: TrackFilterComponent;
  let fixture: ComponentFixture<TrackFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrackFilterComponent ]
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
