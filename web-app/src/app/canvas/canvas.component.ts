import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  ViewChild,
} from '@angular/core';
import { Point, mousePosFromEvent } from '@pictionary/shared';
import { fromEvent, pairwise, switchMap, takeUntil } from 'rxjs';

@Component({
  selector: 'app-canvas',
  standalone: true,
  imports: [],
  templateUrl: './canvas.component.html',
  styleUrl: './canvas.component.css',
})
export class CanvasComponent implements AfterViewInit {
  @Input() width = 600;
  @Input() height = 400;

  @ViewChild('canvasRef')
  canvas!: ElementRef<HTMLCanvasElement>;
  context: any;

  public ngAfterViewInit() {
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    this.context = canvasEl.getContext('2d');

    this.context.lineWidth = 3;
    this.context.lineCap = 'round';
    this.context.strokeStyle = '#000';

    fromEvent<MouseEvent>(canvasEl, 'mousedown')
      .pipe(
        switchMap(() =>
          fromEvent<MouseEvent>(canvasEl, 'mousemove').pipe(
            takeUntil(fromEvent<MouseEvent>(canvasEl, 'mouseup')),
            pairwise()
          )
        )
      )
      .subscribe((res: [MouseEvent, MouseEvent]) => {
        const prevPos = mousePosFromEvent(res[0], canvasEl);
        const currentPos = mousePosFromEvent(res[1], canvasEl);
        this.draw(prevPos, currentPos);
      });
  }

  private draw(prevPos: Point, currentPos: Point) {
    if (!this.context) return;

    this.context.beginPath();
    this.context.moveTo(prevPos.x, prevPos.y);
    this.context.lineTo(currentPos.x, currentPos.y);
    this.context.stroke();
  }
}
