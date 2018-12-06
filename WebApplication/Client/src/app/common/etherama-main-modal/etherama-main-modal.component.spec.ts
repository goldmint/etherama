import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EtheramaMainModalComponent } from './etherama-main-modal.component';

describe('EtheramaMainModalComponent', () => {
  let component: EtheramaMainModalComponent;
  let fixture: ComponentFixture<EtheramaMainModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EtheramaMainModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EtheramaMainModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
