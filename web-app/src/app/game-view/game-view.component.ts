import { Component } from "@angular/core";
import { SocketService } from "../socket.service";
import { CanvasComponent } from "../canvas/canvas.component";
import { CommonModule } from "@angular/common";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/Option";
import { getStatusMessage } from "../../util/session";

@Component({
  selector: "app-game-view",
  standalone: true,
  imports: [CanvasComponent, CommonModule],
  templateUrl: "./game-view.component.html",
  styleUrl: "./game-view.component.css",
})
export class GameViewComponent {
  constructor(public socketService: SocketService) {}

  public getStatusMessage = () =>
    pipe(
      this.socketService.session,
      O.fromNullable,
      O.map(getStatusMessage),
      O.toUndefined,
    );
}
