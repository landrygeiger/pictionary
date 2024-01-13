import { Component, Input } from "@angular/core";
import { CanvasComponent } from "../canvas/canvas.component";
import { CommonModule } from "@angular/common";
import { getStatusMessage } from "../../util/session";
import { PlayerListComponent } from "../player-list/player-list.component";
import { Session, WithId } from "@pictionary/shared";

@Component({
  selector: "app-game-view",
  standalone: true,
  imports: [CanvasComponent, CommonModule, PlayerListComponent],
  templateUrl: "./game-view.component.html",
  styleUrl: "./game-view.component.css",
})
export class GameViewComponent {
  @Input({ required: true }) session!: WithId<Session>;
  public status = () => getStatusMessage(this.session);
}
