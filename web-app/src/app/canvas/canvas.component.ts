import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  ViewChild,
} from '@angular/core';
import {
  CanvasConfig,
  Point,
  relativeMousePosFromEvent,
} from '@pictionary/shared';
import { fromEvent, pairwise, switchMap, takeUntil } from 'rxjs';
import { SocketService } from '../socket.service';
import { CanvasConfigSelectorComponent } from '../color-selector/canvas-config-selector.component';

@Component({
  selector: 'app-canvas',
  standalone: true,
  imports: [CanvasConfigSelectorComponent],
  templateUrl: './canvas.component.html',
  styleUrl: './canvas.component.css',
})
export class CanvasComponent implements AfterViewInit {
  @Input() width = 600;
  @Input() height = 400;

  @ViewChild('canvasRef')
  canvas!: ElementRef<HTMLCanvasElement>;
  context!: CanvasRenderingContext2D | null;

  config: CanvasConfig = { color: '#000', lineWidth: 3 };

  constructor(public socketService: SocketService) {}

  public ngAfterViewInit() {
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    this.context = canvasEl.getContext('2d');

    this.socketService.drawEventSubject.subscribe((drawEventParams) =>
      this.draw(
        drawEventParams.start,
        drawEventParams.end,
        drawEventParams.color
      )
    );

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
        const prevPos = relativeMousePosFromEvent(res[0], canvasEl);
        const currentPos = relativeMousePosFromEvent(res[1], canvasEl);
        this.draw(prevPos, currentPos, this.config.color);
        this.socketService.emitDraw({
          start: prevPos,
          end: currentPos,
          color: this.config.color,
        });
      });
  }

  private draw(prevPos: Point, currentPos: Point, color: string) {
    if (!this.context) return;

    this.context.strokeStyle = color;
    this.context.lineWidth = this.config.lineWidth;
    this.context.lineCap = 'round';

    this.context.beginPath();
    this.context.moveTo(prevPos.x, prevPos.y);
    this.context.lineTo(currentPos.x, currentPos.y);
    this.context.stroke();
  }
}
