import * as TE from "fp-ts/TaskEither";
import * as A from "fp-ts/Array";
import * as IOE from "fp-ts/IOEither";
import * as E from "fp-ts/Either";
import { Mutex } from "async-mutex";
import {
  AlreadyExistsError,
  MutexError,
  NotFoundError,
  alreadyExistsError,
  mutexError,
  not,
  notFoundError,
} from "@pictionary/shared";
import { flow, pipe } from "fp-ts/lib/function";

export type Store<T> = {
  data: Map<string, T>;
  mutex: Mutex;
};

export type WithKey<T> = T & { key: string };

export const store = <T>(): Store<T> => ({
  data: new Map(),
  mutex: new Mutex(),
});

export const create =
  <T>(store: Store<T>) =>
  (value: T) =>
    flow(
      IOE.fromPredicate(not(store.data.has.bind(store.data)), (key) =>
        alreadyExistsError(`Key ${key} already exists in store.`)
      ),
      IOE.tap((key) => IOE.of(store.data.set(key, value)))
    );

const read = <T>(store: Store<T>) =>
  IOE.liftNullable(store.data.get.bind(store.data), (key) =>
    notFoundError(`Key ${key} doesn't exist in store.`)
  );

const update =
  <T>(store: Store<T>) =>
  (updateFn: (a: T) => T) =>
  (key: string) =>
    pipe(
      key,
      read(store),
      IOE.map(updateFn),
      IOE.tap((newValue) => IOE.of(store.data.set(key, newValue)))
    );

const updateEither =
  <T, E>(store: Store<T>) =>
  (updateFn: (a: T) => E.Either<E, T>) =>
  (key: string) =>
    pipe(
      key,
      read(store),
      IOE.flatMap(IOE.fromEitherK(updateFn)),
      IOE.tap((newValue) => IOE.of(store.data.set(key, newValue)))
    );

const remove = <T>(store: Store<T>) =>
  flow(
    IOE.fromPredicate(store.data.has.bind(store.data), (key) =>
      notFoundError(`Key ${key} doesn't exist in store.`)
    ),
    IOE.tap((key) => IOE.of(store.data.delete(key)))
  );

const removeMany = <T>(store: Store<T>) =>
  A.traverse(IOE.ApplicativeSeq)(remove(store));

const list = <T>(store: Store<T>) =>
  IOE.right(
    [...store.data.keys()].map(
      (key): WithKey<T> => ({ ...(store.data.get(key) as T), key })
    )
  );

const acquireMutex = <T>(store: Store<T>) =>
  TE.tryCatch(
    () => store.mutex.acquire(),
    () => mutexError("Failed to acquire mutex.")
  );

const releaseMutex = (release: () => void) => TE.of(release());

export type StoreAPI<T> = {
  create: (
    key: string
  ) => (value: T) => TE.TaskEither<MutexError | AlreadyExistsError, string>;
  read: (key: string) => TE.TaskEither<MutexError | NotFoundError, T>;
  update: (
    key: string
  ) => (updateFn: (a: T) => T) => TE.TaskEither<MutexError | NotFoundError, T>;
  updateEither: (
    key: string
  ) => <E>(
    updateFn: (a: T) => E.Either<E, T>
  ) => TE.TaskEither<E | MutexError | NotFoundError, T>;
  delete: (key: string) => TE.TaskEither<MutexError | NotFoundError, string>;
  deleteMany: (
    keys: string[]
  ) => TE.TaskEither<MutexError | NotFoundError, string[]>;
  list: () => TE.TaskEither<MutexError, WithKey<T>[]>;
};

export const storeAPI = <T>(store: Store<T>): StoreAPI<T> => ({
  create: (key: string) => (value: T) =>
    TE.bracketW(
      acquireMutex(store),
      () => TE.fromIOEither(create(store)(value)(key)),
      releaseMutex
    ),
  read: (key: string) =>
    TE.bracketW(
      acquireMutex(store),
      () => TE.fromIOEither(read(store)(key)),
      releaseMutex
    ),
  update: (key: string) => (updateFn: (a: T) => T) =>
    TE.bracketW(
      acquireMutex(store),
      () => TE.fromIOEither(update(store)(updateFn)(key)),
      releaseMutex
    ),
  updateEither:
    (key: string) =>
    <E>(updateFn: (a: T) => E.Either<E, T>) =>
      TE.bracketW(
        acquireMutex(store),
        () => TE.fromIOEither(updateEither<T, E>(store)(updateFn)(key)),
        releaseMutex
      ),
  delete: (key: string) =>
    TE.bracketW(
      acquireMutex(store),
      () => TE.fromIOEither(remove(store)(key)),
      releaseMutex
    ),
  deleteMany: (keys: string[]) =>
    TE.bracketW(
      acquireMutex(store),
      () => TE.fromIOEither(removeMany(store)(keys)),
      releaseMutex
    ),
  list: () =>
    TE.bracketW(
      acquireMutex(store),
      () => TE.fromIOEither(list(store)),
      releaseMutex
    ),
});
