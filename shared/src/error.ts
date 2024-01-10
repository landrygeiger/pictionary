export type AlreadyExistsError = {
  kind: "already-exists-error";
  message: string;
};

export const alreadyExistsError = (message: string): AlreadyExistsError => ({
  kind: "already-exists-error",
  message,
});

export type NotFoundError = {
  kind: "not-found-error";
  message: string;
};

export const notFoundError = (message: string): NotFoundError => ({
  kind: "not-found-error",
  message,
});

export type MutexError = {
  kind: "mutex-error";
  message: string;
};

export const mutexError = (message: string): MutexError => ({
  kind: "mutex-error",
  message,
});

export type SessionError = {
  kind: "session-error";
  message: string;
};

export const sessionError = (message: string): SessionError => ({
  kind: "session-error",
  message,
});
