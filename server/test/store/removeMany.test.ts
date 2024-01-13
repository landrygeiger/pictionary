import * as E from "fp-ts/Either";
import { removeMany, store } from "../../src/store";
import { NotFoundError, notFoundError } from "@pictionary/shared";

describe("removeMany", () => {
  it("errors when a key isn't in the store", () => {
    const numberStore = store<number>();

    const key = "test-key";
    const value = 78;

    numberStore.data.set(key, value);

    const keys = ["test-key", "not-in-store"];

    const result = removeMany(numberStore)(keys)();

    const expected: E.Either<NotFoundError, never> = E.left(
      notFoundError("Key not-in-store doesn't exist in store."),
    );

    expect(result).toEqual(expected);
  });

  it("removes all entries specified by keys", () => {
    const numberStore = store<number>();

    const entries: [string, number][] = [
      ["one", 23],
      ["two", 400],
      ["three", 11],
      ["four", 24],
      ["five", 6],
    ];

    entries.forEach(entry => numberStore.data.set(entry[0], entry[1]));

    const toRemove = ["one", "three", "four"];

    removeMany(numberStore)(toRemove)();

    const result = [...numberStore.data.entries()];

    const expected = [entries[1], entries[4]];

    expect(result).toEqual(expected);
  });
});
