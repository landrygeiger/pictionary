import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  ViewChild,
} from "@angular/core";
import {
  CanvasConfig,
  Point,
  relativeMousePosFromEvent,
} from "@pictionary/shared";
import { fromEvent, pairwise, switchMap, takeUntil } from "rxjs";
import { SocketService } from "../socket.service";
import { CanvasConfigSelectorComponent } from "../canvas-config-selector/canvas-config-selector.component";

@Component({
  selector: "app-canvas",
  standalone: true,
  imports: [CanvasConfigSelectorComponent],
  templateUrl: "./canvas.component.html",
  styleUrl: "./canvas.component.css",
})
export class CanvasComponent implements AfterViewInit {
  @Input() width = 598;
  @Input() height = 398;

  @ViewChild("canvasRef")
  canvas!: ElementRef<HTMLCanvasElement>;
  context!: CanvasRenderingContext2D | null;

  config: CanvasConfig = { color: "#000", lineWidth: 5 };

  constructor(public socketService: SocketService) {}

  public ngAfterViewInit() {
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    this.context = canvasEl.getContext("2d");

    this.socketService.drawEventSubject.subscribe(drawEventParams =>
      this.draw(
        drawEventParams.start,
        drawEventParams.end,
        drawEventParams.color,
        drawEventParams.lineWidth,
      ),
    );

    fromEvent<MouseEvent>(canvasEl, "mousedown")
      .pipe(
        switchMap(() =>
          fromEvent<MouseEvent>(canvasEl, "mousemove").pipe(
            takeUntil(fromEvent<MouseEvent>(canvasEl, "mouseup")),
            pairwise(),
          ),
        ),
      )
      .subscribe((res: [MouseEvent, MouseEvent]) => {
        const prevPos = relativeMousePosFromEvent(res[0], canvasEl);
        const currentPos = relativeMousePosFromEvent(res[1], canvasEl);
        this.draw(
          prevPos,
          currentPos,
          this.config.color,
          this.config.lineWidth,
        );
        if (this.socketService.session) {
          this.socketService.emitDraw({
            start: prevPos,
            end: currentPos,
            color: this.config.color,
            lineWidth: this.config.lineWidth,
            sessionId: this.socketService.session.id,
          });
        }
      });
  }

  private draw(
    prevPos: Point,
    currentPos: Point,
    color: string,
    lineWidth: number,
  ) {
    if (!this.context) return;

    this.context.strokeStyle = color;
    this.context.lineWidth = lineWidth;
    this.context.lineCap = "round";

    this.context.beginPath();
    this.context.moveTo(prevPos.x, prevPos.y);
    this.context.lineTo(currentPos.x, currentPos.y);
    this.context.stroke();
  }
}
