import * as E from "fp-ts/Either";
import { increment } from "fp-ts/lib/function";
import { store, update } from "../../src/store";
import { NotFoundError, notFoundError } from "@pictionary/shared";

describe("update", () => {
  it("returns error when the key is not in store", () => {
    const numberStore = store<number>();

    const key = "test-key";

    const result = update(numberStore)(increment)(key)();

    const expected: E.Either<NotFoundError, never> = E.left(
      notFoundError(`Key ${key} doesn't exist in store.`),
    );

    expect(result).toEqual(expected);
  });

  it("updates the value using the function", () => {
    const numberStore = store<number>();

    const key = "test-key";
    const initialValue = 32;

    numberStore.data.set(key, initialValue);

    const f = increment;

    const result = update(numberStore)(f)(key)();

    const expected: E.Either<never, number> = E.right(f(initialValue));

    expect(result).toEqual(expected);
  });
});
