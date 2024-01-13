import { ComponentFixture, TestBed } from "@angular/core/testing";
import { CanvasConfigSelectorComponent } from "./canvas-config-selector.component";

describe("CanvasConfigSelectorComponent", () => {
  let component: CanvasConfigSelectorComponent;
  let fixture: ComponentFixture<CanvasConfigSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CanvasConfigSelectorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CanvasConfigSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
