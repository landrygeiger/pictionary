import { Component, Input } from '@angular/core';
import { SizeSelectorButtonComponent } from '../size-selector-button/size-selector-button.component';
import { CanvasConfig } from '@pictionary/shared';

@Component({
  selector: 'app-size-selector',
  standalone: true,
  imports: [SizeSelectorButtonComponent],
  templateUrl: './size-selector.component.html',
  styleUrl: './size-selector.component.css',
})
export class SizeSelectorComponent {
  @Input({ required: true }) config!: CanvasConfig;
  readonly sizes = ['5px', '10px', '20px', '40px'];
}
