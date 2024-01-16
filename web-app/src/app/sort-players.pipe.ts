import { Pipe, PipeTransform } from "@angular/core";
import * as A from "fp-ts/Array";
import { Player, byScore } from "@pictionary/shared";
import { pipe } from "fp-ts/lib/function";

@Pipe({
  name: "sortPlayers",
  standalone: true,
})
export class SortPlayersPipe implements PipeTransform {
  transform(players: Player[]): Player[] {
    return pipe(players, A.sort(byScore), A.reverse);
  }
}
