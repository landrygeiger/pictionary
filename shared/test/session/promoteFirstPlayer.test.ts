import { Player } from "../../src";
import { promoteFirstPlayer } from "../../src/session";

describe("promoteFirstPlayer", () => {
  it("promotes first player in normal list", () => {
    const ps: Player[] = [
      { name: "Test Player 1", socketId: "test-socket-id-1", owner: false },
      { name: "Test Player 2", socketId: "test-socket-id-2", owner: false },
      { name: "Test Player 3", socketId: "test-socket-id-3", owner: false },
    ];

    const result = promoteFirstPlayer(ps);

    const expected: Player[] = [
      { name: "Test Player 1", socketId: "test-socket-id-1", owner: true },
      { name: "Test Player 2", socketId: "test-socket-id-2", owner: false },
      { name: "Test Player 3", socketId: "test-socket-id-3", owner: false },
    ];

    expect(result).toEqual(expected);
  });

  it("promotes first player in list of size 1", () => {
    const ps: Player[] = [
      { name: "Test Player 1", socketId: "test-socket-id-1", owner: false },
    ];

    const result = promoteFirstPlayer(ps);

    const expected: Player[] = [
      { name: "Test Player 1", socketId: "test-socket-id-1", owner: true },
    ];

    expect(result).toEqual(expected);
  });

  it("returns empty list when provided an empty list", () => {
    const ps: Player[] = [];

    const result = promoteFirstPlayer(ps);

    const expected: Player[] = [];

    expect(result).toEqual(expected);
  });
});
