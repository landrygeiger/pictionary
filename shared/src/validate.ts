import * as E from "fp-ts/Either";
import { validationError } from "./error";
import { flow } from "fp-ts/lib/function";
import { isEmptyStr, isLongerThan, not } from "./pure-util";
import { config } from "./config";

export const validateName = flow(
  E.fromPredicate(not(isEmptyStr), () =>
    validationError("Names must not be empty.")
  ),
  E.filterOrElse(not(isLongerThan(config.maxNameLength)), () =>
    validationError(
      `Names must be less than ${config.maxNameLength} characters long.`
    )
  )
);

export const validateSessionId = E.fromPredicate(not(isEmptyStr), () =>
  validationError("Session ids must not be empty.")
);
