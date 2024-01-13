import { NotFoundError, notFoundError } from "@pictionary/shared";
import { read, store } from "../../src/store";
import * as E from "fp-ts/Either";

describe("read", () => {
  it("returns error when key not in store", () => {
    const numberStore = store<number>();

    const key = "test-key";

    const result = read(numberStore)(key)();

    const expected: E.Either<NotFoundError, never> = E.left(
      notFoundError(`Key ${key} doesn't exist in store.`),
    );

    expect(result).toEqual(expected);
  });

  it("returns the value", () => {
    const numberStore = store<number>();

    const key = "test-key";
    const value = 783;

    numberStore.data.set(key, value);

    const result = read(numberStore)(key)();

    const expected = E.right(value);

    expect(result).toEqual(expected);
  });
});
