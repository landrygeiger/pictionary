export type Session = {
  state: "lobby";
  players: Player[];
};

export type Player = {
  name: string;
  owner: boolean;
};
