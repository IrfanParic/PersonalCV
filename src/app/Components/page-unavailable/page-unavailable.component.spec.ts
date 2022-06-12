import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageUnavailableComponent } from './page-unavailable.component';

describe('PageUnavailableComponent', () => {
  let component: PageUnavailableComponent;
  let fixture: ComponentFixture<PageUnavailableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageUnavailableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageUnavailableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
