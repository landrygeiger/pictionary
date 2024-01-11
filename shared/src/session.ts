export type Session = LobbySessionState | AbandonedSessionState;

export type LobbySessionState = {
  state: "lobby";
  players: Player[];
};

export type AbandonedSessionState = {
  state: "abandoned";
};

export type Player = {
  name: string;
  owner: boolean;
};
