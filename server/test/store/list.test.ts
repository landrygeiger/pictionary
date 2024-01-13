import { list, store } from "../../src/store";
import * as E from "fp-ts/Either";

describe("list", () => {
  it("returns all entries", () => {
    const numberStore = store<number>();

    const entries: [string, number][] = [
      ["one", 23],
      ["two", 400],
      ["three", 11],
      ["four", 24],
      ["five", 6],
    ];

    entries.forEach((entry) => numberStore.data.set(entry[0], entry[1]));

    const result = list(numberStore)();

    const expected: E.Either<never, [string, number][]> = E.right(entries);

    expect(result).toEqual(expected);
  });

  it("returns empty list when store empty", () => {
    const numberStore = store<number>();

    const result = list(numberStore)();

    const expected: E.Either<never, [string, number][]> = E.right([]);

    expect(result).toEqual(expected);
  });
});
