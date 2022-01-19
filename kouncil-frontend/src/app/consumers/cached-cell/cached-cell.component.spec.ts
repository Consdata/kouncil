import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CachedCellComponent } from './cached-cell.component';
import { SearchService } from '../../search.service';
import { ServersService } from '../../servers.service';

describe('CachedCellComponent', () => {
  let component: CachedCellComponent;
  let fixture: ComponentFixture<CachedCellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        SearchService,
        ServersService
      ],
      declarations: [ CachedCellComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CachedCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
