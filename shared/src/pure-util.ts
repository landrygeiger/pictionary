import * as P from "fp-ts/Predicate";
import { flow } from "fp-ts/lib/function";

export const not = <T>(predicate: P.Predicate<T>) => flow(predicate, x => !x);

export const isEmptyStr = (s: string) => s.length === 0;

export const isEmptyArr = <A>(as: A[]) => as.length === 0;

export const isLongerThan = (n: number) => (s: string) => s.length > n;
