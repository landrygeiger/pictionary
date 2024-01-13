import * as E from "fp-ts/Either";
import { expect } from "@jest/globals";
import { NotFoundError, notFoundError } from "@pictionary/shared";
import { remove, store } from "../../src/store";

describe("remove", () => {
  it("returns error if key doesn't exist in store", () => {
    const numberStore = store<number>();

    const key = "test-key";

    const result = remove(numberStore)(key)();

    const expected: E.Either<NotFoundError, never> = E.left(
      notFoundError(`Key ${key} doesn't exist in store.`),
    );

    expect(result).toEqual(expected);
  });

  it("removes the entry in the store", () => {
    const numberStore = store<number>();

    const key = "test-key";
    const value = 78;

    numberStore.data.set(key, value);

    remove(numberStore)(key)();

    expect(numberStore.data.has(key)).toBeFalsy();
  });
});
