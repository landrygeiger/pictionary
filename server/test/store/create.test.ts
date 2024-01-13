import { AlreadyExistsError, alreadyExistsError } from "@pictionary/shared";
import { create, store } from "../../src/store";
import * as E from "fp-ts/Either";

describe("create", () => {
  it("errors if the key already exists", () => {
    const numberStore = store<number>();

    const key = "test-key";

    numberStore.data.set(key, 13);

    const result = create(numberStore)(27)(key)();

    const expected: E.Either<AlreadyExistsError, never> = E.left(
      alreadyExistsError(`Key ${key} already exists in store.`),
    );

    expect(result).toEqual(expected);
  });

  it("creates an entry in the store", () => {
    const numberStore = store<number>();

    const key = "test-key";
    const value = 63;

    create(numberStore)(value)(key)();

    const result = numberStore.data.get(key);

    expect(result).toEqual(value);
  });
});
