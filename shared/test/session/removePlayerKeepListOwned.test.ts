import { Player, removePlayerKeepListOwned } from "../../src";

describe("removePlayerKeepListOwned", () => {
  it("removes the player", () => {
    const p: Player = {
      name: "Test Player 4",
      socketId: "test-socket-id-4",
      owner: false,
      guessedWord: false,
      score: 0,
    };

    const ps: Player[] = [
      {
        name: "Test Player 1",
        socketId: "test-socket-id-1",
        owner: false,
        score: 0,
        guessedWord: false,
      },
      {
        name: "Test Player 2",
        socketId: "test-socket-id-2",
        owner: true,
        score: 0,
        guessedWord: false,
      },
      {
        name: "Test Player 3",
        socketId: "test-socket-id-3",
        owner: false,
        score: 0,
        guessedWord: false,
      },
      p,
      {
        name: "Test Player 5",
        socketId: "test-socket-id-5",
        owner: false,
        score: 0,
        guessedWord: false,
      },
    ];

    const result = removePlayerKeepListOwned(ps)(p);

    const expected: Player[] = [
      {
        name: "Test Player 1",
        socketId: "test-socket-id-1",
        owner: false,
        score: 0,
        guessedWord: false,
      },
      {
        name: "Test Player 2",
        socketId: "test-socket-id-2",
        owner: true,
        score: 0,
        guessedWord: false,
      },
      {
        name: "Test Player 3",
        socketId: "test-socket-id-3",
        owner: false,
        score: 0,
        guessedWord: false,
      },
      {
        name: "Test Player 5",
        socketId: "test-socket-id-5",
        owner: false,
        score: 0,
        guessedWord: false,
      },
    ];

    expect(result).toEqual(expected);
  });

  it("promotes the first player in list when owner is removed", () => {
    const p: Player = {
      name: "Test Player 2",
      socketId: "test-socket-id-2",
      owner: true,
      score: 0,
      guessedWord: false,
    };

    const ps: Player[] = [
      {
        name: "Test Player 1",
        socketId: "test-socket-id-1",
        owner: false,
        score: 0,
        guessedWord: false,
      },
      p,
      {
        name: "Test Player 3",
        socketId: "test-socket-id-3",
        owner: false,
        score: 0,
        guessedWord: false,
      },
      {
        name: "Test Player 4",
        socketId: "test-socket-id-4",
        owner: false,
        score: 0,
        guessedWord: false,
      },
      {
        name: "Test Player 5",
        socketId: "test-socket-id-5",
        owner: false,
        score: 0,
        guessedWord: false,
      },
    ];

    const result = removePlayerKeepListOwned(ps)(p);

    const expected: Player[] = [
      {
        name: "Test Player 1",
        socketId: "test-socket-id-1",
        owner: true,
        score: 0,
        guessedWord: false,
      },
      {
        name: "Test Player 3",
        socketId: "test-socket-id-3",
        owner: false,
        score: 0,
        guessedWord: false,
      },
      {
        name: "Test Player 4",
        socketId: "test-socket-id-4",
        owner: false,
        score: 0,
        guessedWord: false,
      },
      {
        name: "Test Player 5",
        socketId: "test-socket-id-5",
        owner: false,
        score: 0,
        guessedWord: false,
      },
    ];

    expect(result).toEqual(expected);
  });

  it("returns an empty list when the last player is removed", () => {
    const p: Player = {
      name: "Test Player 1",
      score: 0,
      guessedWord: false,
      socketId: "test-socket-id-1",
      owner: true,
    };

    const ps: Player[] = [p];

    const result = removePlayerKeepListOwned(ps)(p);

    const expected: Player[] = [];

    expect(result).toEqual(expected);
  });
});
