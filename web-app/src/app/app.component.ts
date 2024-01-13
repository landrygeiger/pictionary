import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterOutlet } from "@angular/router";
import { RoomSelectorComponent } from "./room-selector/room-selector.component";
import { GameViewComponent } from "./game-view/game-view.component";
import { SocketService } from "./socket.service";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    GameViewComponent,
    RoomSelectorComponent,
  ],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
})
export class AppComponent {
  title = "web-app";
  constructor(public socketService: SocketService) {}
}
