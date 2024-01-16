import * as P from "fp-ts/Predicate";
import * as S from "fp-ts/string";
import * as A from "fp-ts/Array";
import * as RA from "fp-ts/ReadonlyArray";
import { flow } from "fp-ts/lib/function";

export const not = <T>(predicate: P.Predicate<T>) => flow(predicate, x => !x);

export const isEmptyStr = (s: string) => s.length === 0;

export const isEmptyArr = <A>(as: A[]) => as.length === 0;

export const isLongerThan = (n: number) => (s: string) => s.length > n;

export const randomElement = <A>(as: A[]) =>
  as[Math.floor(Math.random() * as.length)];

export const wordToBlanks = flow(
  S.split(""),
  RA.toArray,
  A.map(() => "_"),
  A.intercalate(S.Monoid)(" "),
);
