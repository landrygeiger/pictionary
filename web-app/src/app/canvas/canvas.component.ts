import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  ViewChild,
} from '@angular/core';

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

  prevX = 0;
  prevY = 0;

  currX = 0;
  currY = 0;

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
