import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterOutlet } from "@angular/router";
import { CanvasComponent } from "./canvas/canvas.component";
import { RoomSelectorComponent } from "./room-selector/room-selector.component";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterOutlet, CanvasComponent, RoomSelectorComponent],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
})
export class AppComponent {
  title = "web-app";
}
