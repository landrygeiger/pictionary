import { Component, Input } from '@angular/core';
import { CanvasConfig } from '@pictionary/shared';
import { ColorSelectorButtonComponent } from '../color-selector-button/color-selector-button.component';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-color-selector',
  standalone: true,
  imports: [ColorSelectorButtonComponent, NgFor],
  templateUrl: './color-selector.component.html',
  styleUrl: './color-selector.component.css',
})
export class ColorSelectorComponent {
  @Input({ required: true }) config!: CanvasConfig;

  readonly colors = ['#FF0000', '#0000FF', '#00FF00', '#FFFF00', '#FF00FF'];
}
