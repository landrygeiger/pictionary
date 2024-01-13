import * as E from "fp-ts/Either";
import { flow, increment } from "fp-ts/lib/function";
import { store, updateEither } from "../../src/store";
import { NotFoundError, notFoundError } from "@pictionary/shared";

describe("updateEither", () => {
  it("returns error if the key isn't in store", () => {
    const numberStore = store<number>();

    const key = "test-key";

    const f = flow(increment, E.right);

    const result = updateEither(numberStore)(f)(key)();

    const expected: E.Either<NotFoundError, never> = E.left(
      notFoundError(`Key ${key} doesn't exist in store.`),
    );

    expect(result).toEqual(expected);
  });

  it("returns error if update errors", () => {
    const numberStore = store<number>();

    const key = "test-key";
    const initialValue = 21;

    numberStore.data.set(key, initialValue);

    const incrEvens = flow(
      E.fromPredicate(
        (n: number) => n % 2 === 0,
        () => "error!",
      ),
      E.map(increment),
    );

    const result = updateEither(numberStore)(incrEvens)(key)();

    const expected: E.Either<string, never> = E.left("error!");

    expect(result).toEqual(expected);
  });

  it("applies function to value on success", () => {
    const numberStore = store<number>();

    const key = "test-key";
    const initialValue = 22;

    numberStore.data.set(key, initialValue);

    const incrEvens = flow(
      E.fromPredicate(
        (n: number) => n % 2 === 0,
        () => "error!",
      ),
      E.map(increment),
    );

    const result = updateEither(numberStore)(incrEvens)(key)();

    const expected: E.Either<never, number> = E.right(increment(initialValue));

    expect(result).toEqual(expected);
  });
});
