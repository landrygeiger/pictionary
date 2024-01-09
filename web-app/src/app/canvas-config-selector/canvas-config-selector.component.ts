import { Component, Input } from '@angular/core';
import { CanvasConfig } from '@pictionary/shared';
import { ColorSelectorButtonComponent } from '../color-selector-button/color-selector-button.component';
import { NgFor } from '@angular/common';
import { SizeSelectorButtonComponent } from '../size-selector-button/size-selector-button.component';

@Component({
  selector: 'app-canvas-config-selector',
  standalone: true,
  imports: [ColorSelectorButtonComponent, SizeSelectorButtonComponent, NgFor],
  templateUrl: './canvas-config-selector.component.html',
  styleUrl: './canvas-config-selector.component.css',
})
export class CanvasConfigSelectorComponent {
  @Input({ required: true }) config!: CanvasConfig;

  readonly sizes = [5, 10, 20, 40];

  readonly colors = [
    // Monochromatic
    '#ffffff', // White
    '#000000', // Black
    '#808080', // Gray
    '#c0c0c0', // Silver

    // Primary Colors
    '#ff0000', // Red
    '#00ff00', // Green
    '#0000ff', // Blue

    // Secondary Colors
    '#ffff00', // Yellow
    '#ff00ff', // Magenta
    '#00ffff', // Cyan

    // Tertiary Colors
    '#800000', // Maroon
    '#008000', // Olive
    '#000080', // Navy

    // Other Colors
    '#ff9900', // Orange
    '#cc6600', // Brown
    '#800080', // Purple
    '#008080', // Teal

    // Additional Colors
    '#3366cc', // Royal Blue
    '#993366', // Rose
    '#669966', // Mint Green
  ];
}
