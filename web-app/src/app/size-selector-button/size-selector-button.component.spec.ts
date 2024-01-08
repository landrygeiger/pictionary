import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SizeSelectorButtonComponent } from './size-selector-button.component';

describe('SizeSelectorButtonComponent', () => {
  let component: SizeSelectorButtonComponent;
  let fixture: ComponentFixture<SizeSelectorButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SizeSelectorButtonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SizeSelectorButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
