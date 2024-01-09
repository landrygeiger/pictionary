import { Component, Input } from '@angular/core';
import { CanvasConfig } from '@pictionary/shared';

@Component({
  selector: 'app-color-selector-button',
  standalone: true,
  imports: [],
  templateUrl: './color-selector-button.component.html',
  styleUrl: './color-selector-button.component.css',
})
export class ColorSelectorButtonComponent {
  @Input({ required: true }) config!: CanvasConfig;
  @Input() color = '#000000';
}
