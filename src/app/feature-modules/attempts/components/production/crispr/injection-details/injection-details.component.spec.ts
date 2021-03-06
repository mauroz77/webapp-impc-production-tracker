import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InjectionDetailsComponent } from './injection-details.component';

describe('InjectionDetailsComponent', () => {
  let component: InjectionDetailsComponent;
  let fixture: ComponentFixture<InjectionDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InjectionDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InjectionDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
