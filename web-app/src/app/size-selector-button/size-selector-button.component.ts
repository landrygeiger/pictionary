import { Component, Input } from '@angular/core';
import { CanvasConfig } from '@pictionary/shared';

@Component({
  selector: 'app-size-selector-button',
  standalone: true,
  imports: [],
  templateUrl: './size-selector-button.component.html',
  styleUrl: './size-selector-button.component.css',
})
export class SizeSelectorButtonComponent {
  @Input() size = 10;
  @Input({ required: true }) config!: CanvasConfig;
}
