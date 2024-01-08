import { Component, Input } from '@angular/core';
import { CanvasConfig } from '@pictionary/shared';

@Component({
  selector: 'app-color-selector',
  standalone: true,
  imports: [],
  templateUrl: './color-selector.component.html',
  styleUrl: './color-selector.component.css',
})
export class ColorSelectorComponent {
  @Input({ required: true }) config!: CanvasConfig;
}
