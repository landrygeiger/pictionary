import { Component, Input } from "@angular/core";
import { Player } from "@pictionary/shared";
import { CommonModule } from "@angular/common";
import { SortPlayersPipe } from "../sort-players.pipe";

@Component({
  selector: "app-player-list",
  standalone: true,
  imports: [CommonModule, SortPlayersPipe],
  templateUrl: "./player-list.component.html",
  styleUrl: "./player-list.component.css",
})
export class PlayerListComponent {
  @Input({ required: true }) players!: Player[];
}
