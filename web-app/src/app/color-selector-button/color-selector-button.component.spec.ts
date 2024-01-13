import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ColorSelectorButtonComponent } from "./color-selector-button.component";

describe("ColorSelectorButtonComponent", () => {
  let component: ColorSelectorButtonComponent;
  let fixture: ComponentFixture<ColorSelectorButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColorSelectorButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ColorSelectorButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
