import { Component, Input } from "@angular/core";
import * as B from "fp-ts/boolean";
import * as S from "fp-ts/string";
import * as O from "fp-ts/Option";
import { CanvasComponent } from "../canvas/canvas.component";
import { CommonModule } from "@angular/common";
import { getStatusMessage } from "../../util/session";
import { PlayerListComponent } from "../player-list/player-list.component";
import {
  Session,
  WithId,
  getDrawer,
  isRoundState,
  wordToBlanks,
} from "@pictionary/shared";
import { MessageBoxComponent } from "../message-box/message-box.component";
import { SocketService } from "../socket.service";
import { pipe } from "fp-ts/lib/function";

@Component({
  selector: "app-game-view",
  standalone: true,
  imports: [
    CanvasComponent,
    CommonModule,
    PlayerListComponent,
    MessageBoxComponent,
  ],
  templateUrl: "./game-view.component.html",
  styleUrl: "./game-view.component.css",
})
export class GameViewComponent {
  @Input({ required: true }) session!: WithId<Session>;

  constructor(public socketService: SocketService) {}

  public status = () => getStatusMessage(this.session);

  public handleStart = () =>
    this.socketService.emitStart({ sessionId: this.session.id });

  public getWhoDrawingMessage = () =>
    pipe(
      O.Do,
      O.bind("session", () =>
        pipe(
          this.socketService.session,
          O.fromNullable,
          O.filter(isRoundState),
        ),
      ),
      O.bind("drawer", ({ session }) => getDrawer(session.players)),
      O.bind("currentPlayer", () =>
        pipe(this.socketService.getCurrentPlayer(), O.fromNullable),
      ),
      O.map(({ drawer, currentPlayer, session }) =>
        drawer.socketId === currentPlayer.socketId
          ? `YOU are drawing! Your word is: ${session.word}`
          : `${drawer.name} is drawing! Their word is: ${wordToBlanks(
              session.word,
            )} `,
      ),
      O.getOrElse(() => S.empty),
    );
}
