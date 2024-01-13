import { Player, removePlayerKeepListOwned } from "../../src";

describe("removePlayerKeepListOwned", () => {
  it("removes the player", () => {
    const p: Player = {
      name: "Test Player 4",
      socketId: "test-socket-id-4",
      owner: false,
    };

    const ps: Player[] = [
      { name: "Test Player 1", socketId: "test-socket-id-1", owner: false },
      { name: "Test Player 2", socketId: "test-socket-id-2", owner: true },
      { name: "Test Player 3", socketId: "test-socket-id-3", owner: false },
      p,
      { name: "Test Player 5", socketId: "test-socket-id-5", owner: false },
    ];

    const result = removePlayerKeepListOwned(ps)(p);

    const expected: Player[] = [
      { name: "Test Player 1", socketId: "test-socket-id-1", owner: false },
      { name: "Test Player 2", socketId: "test-socket-id-2", owner: true },
      { name: "Test Player 3", socketId: "test-socket-id-3", owner: false },
      { name: "Test Player 5", socketId: "test-socket-id-5", owner: false },
    ];

    expect(result).toEqual(expected);
  });

  it("promotes the first player in list when owner is removed", () => {
    const p: Player = {
      name: "Test Player 2",
      socketId: "test-socket-id-2",
      owner: true,
    };

    const ps: Player[] = [
      { name: "Test Player 1", socketId: "test-socket-id-1", owner: false },
      p,
      { name: "Test Player 3", socketId: "test-socket-id-3", owner: false },
      { name: "Test Player 4", socketId: "test-socket-id-4", owner: false },
      { name: "Test Player 5", socketId: "test-socket-id-5", owner: false },
    ];

    const result = removePlayerKeepListOwned(ps)(p);

    const expected: Player[] = [
      { name: "Test Player 1", socketId: "test-socket-id-1", owner: true },
      { name: "Test Player 3", socketId: "test-socket-id-3", owner: false },
      { name: "Test Player 4", socketId: "test-socket-id-4", owner: false },
      { name: "Test Player 5", socketId: "test-socket-id-5", owner: false },
    ];

    expect(result).toEqual(expected);
  });

  it("returns an empty list when the last player is removed", () => {
    const p: Player = {
      name: "Test Player 1",
      socketId: "test-socket-id-1",
      owner: true,
    };

    const ps: Player[] = [p];

    const result = removePlayerKeepListOwned(ps)(p);

    const expected: Player[] = [];

    expect(result).toEqual(expected);
  });
});
