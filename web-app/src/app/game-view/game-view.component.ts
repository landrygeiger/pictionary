import { Component } from "@angular/core";
import { SocketService } from "../socket.service";
import { CanvasComponent } from "../canvas/canvas.component";

@Component({
  selector: "app-game-view",
  standalone: true,
  imports: [CanvasComponent],
  templateUrl: "./game-view.component.html",
  styleUrl: "./game-view.component.css",
})
export class GameViewComponent {
  constructor(public socketService: SocketService) {}
}
