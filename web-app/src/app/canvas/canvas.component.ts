import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  ViewChild,
} from '@angular/core';
import { Point } from '@pictionary/shared';

@Component({
  selector: 'app-canvas',
  standalone: true,
  imports: [],
  templateUrl: './canvas.component.html',
  styleUrl: './canvas.component.css',
})
export class CanvasComponent implements AfterViewInit {
  @ViewChild('canvasRef')
  canvas!: ElementRef<HTMLCanvasElement>;

  context!: CanvasRenderingContext2D | null;

  prevPos: Point = { x: 0, y: 0 };
  currPos: Point = { x: 0, y: 0 };

  @HostListener('mousedown') onMouseEnter() {
    this.canvas.nativeElement.style.backgroundColor = 'red';
  }

  @HostListener('mouseup') onMouseLeave() {
    this.canvas.nativeElement.style.backgroundColor = '';
  }

  ngAfterViewInit(): void {
    this.context = this.canvas.nativeElement.getContext('2d');
  }
}
