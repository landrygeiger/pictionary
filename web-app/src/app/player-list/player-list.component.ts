import { Component, Input } from "@angular/core";
import { SocketService } from "../socket.service";
import { Player } from "@pictionary/shared";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-player-list",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./player-list.component.html",
  styleUrl: "./player-list.component.css",
})
export class PlayerListComponent {
  @Input({ required: true }) players!: Player[];
}
