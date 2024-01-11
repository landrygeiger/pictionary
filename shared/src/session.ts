import * as A from "fp-ts/Array";
import * as S from "fp-ts/string";
import * as B from "fp-ts/boolean";
import { not } from "./pure-util";
import * as O from "fp-ts/Option";
import { flip, identity, pipe } from "fp-ts/lib/function";

export type Session = { players: Player[] } & (
  | LobbySessionState
  | EndingSessionState
);

export type LobbySessionState = {
  state: "lobby";
};

export type EndingSessionState = {
  state: "ending";
};

export type Player = {
  name: string;
  owner: boolean;
};

export const playerEq = (p1: Player) => (p2: Player) =>
  S.Eq.equals(p1.name, p2.name) && B.Eq.equals(p1.owner, p2.owner);

export const removePlayerFromList = (p: Player) => A.filter(not(playerEq(p)));

const promotePlayer = (p: Player): Player => ({ ...p, owner: true });

export const promoteFirstPlayer = (ps: Player[]) => [
  ...pipe(
    ps,
    A.head,
    O.match(
      () => [],
      (p) => [promotePlayer(p)]
    )
  ),
  ...pipe(
    ps,
    A.tail,
    O.match(() => [], identity)
  ),
];

export const removePlayerKeepListOwned = (ps: Player[]) => (p: Player) =>
  pipe(
    p,
    flip(removePlayerFromList)(ps),
    p.owner ? promoteFirstPlayer : identity
  );
