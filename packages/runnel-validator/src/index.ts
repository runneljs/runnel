import { Validator } from "@cfworker/json-schema";

export function validator(jsonSchema: object): (payload?: unknown) => boolean {
  if (Object.keys(jsonSchema).length === 0)
    return (payload?: unknown) =>
      typeof payload === "undefined" || payload === null;
  const validator = new Validator(jsonSchema);
  return function (payload?: unknown) {
    return validator.validate(payload).valid;
  };
}
