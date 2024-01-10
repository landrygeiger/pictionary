import * as P from "fp-ts/Predicate";
import { flow } from "fp-ts/lib/function";

export const not = <T>(predicate: P.Predicate<T>) => flow(predicate, (x) => !x);
