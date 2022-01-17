import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TopicComponent } from './topic.component';
import { RouterTestingModule } from '@angular/router/testing';
import { SearchService } from '../search.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialog } from '@angular/material/dialog';
import { ServersService } from '../servers.service';

describe('TopicComponent', () => {
  let component: TopicComponent;
  let fixture: ComponentFixture<TopicComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule
      ],
      providers: [
        { provide: MatDialog, useValue: {} },
        ServersService,
        SearchService
      ],
      declarations: [ TopicComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TopicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
