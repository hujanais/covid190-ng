import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GraphsViewComponent } from './graphs-view.component';

describe('GraphsViewComponent', () => {
  let component: GraphsViewComponent;
  let fixture: ComponentFixture<GraphsViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GraphsViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GraphsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
