import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ToolbarComponent } from './toolbar.component';
import { TopicService } from '../topic.service';
import { ServersService } from '../../servers.service';

describe('ToolbarComponent', () => {
  let component: ToolbarComponent;
  let fixture: ComponentFixture<ToolbarComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [

      ],
      providers: [
        TopicService,
        ServersService
      ],
      declarations: [ ToolbarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
