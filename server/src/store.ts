import * as TE from "fp-ts/TaskEither";
import * as IOE from "fp-ts/IOEither";
import { Mutex } from "async-mutex";
import {
  AlreadyExistsError,
  MutexError,
  NotFoundError,
  alreadyExistsError,
  mutexError,
  notFoundError,
} from "@pictionary/shared";
import { flow, pipe } from "fp-ts/lib/function";

type Store<T> = {
  data: Map<string, T>;
  mutex: Mutex;
};

export const store = <T>(): Store<T> => ({
  data: new Map(),
  mutex: new Mutex(),
});

const create =
  <T>(store: Store<T>) =>
  (value: T) =>
    flow(
      IOE.fromPredicate(store.data.has, (key) =>
        alreadyExistsError(`Key ${key} already exists in store.`)
      ),
      IOE.tap((key) => IOE.of(store.data.set(key, value)))
    );

const read = <T>(store: Store<T>) =>
  IOE.liftNullable(store.data.get, (key) =>
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

const remove = <T>(store: Store<T>) =>
  flow(
    IOE.fromPredicate(store.data.has, (key) =>
      notFoundError(`Key ${key} doesn't exist in store.`)
    ),
    IOE.tap((key) => IOE.of(store.data.delete(key)))
  );

const acquireMutex = <T>(store: Store<T>) =>
  TE.tryCatch(
    () => store.mutex.acquire(),
    () => mutexError("Failed to acquire mutex.")
  );

const releaseMutex = (release: () => void) => TE.of(release());

type StoreAPI<T> = {
  create: (
    key: string
  ) => (value: T) => TE.TaskEither<MutexError | AlreadyExistsError, string>;
  read: (key: string) => TE.TaskEither<MutexError | NotFoundError, T>;
  update: (
    key: string
  ) => (updateFn: (a: T) => T) => TE.TaskEither<MutexError | NotFoundError, T>;
  delete: (key: string) => TE.TaskEither<MutexError | NotFoundError, string>;
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
  delete: (key: string) =>
    TE.bracketW(
      acquireMutex(store),
      () => TE.fromIOEither(remove(store)(key)),
      releaseMutex
    ),
});
