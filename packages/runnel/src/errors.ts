import type { JsonSchema } from "./schema-manager";
import type { TopicId } from "./topic-name-to-id";

export class PayloadMismatchError extends Error {
  constructor(
    public topicId: TopicId,
    public jsonSchema: JsonSchema,
    public payload: unknown,
  ) {
    super(
      [
        `Invalid payload for the topic [${topicId}].`,
        `Please make sure the payload matches the schema.`,
        `JSON Schema:${JSON.stringify(jsonSchema)}`,
        `Payload:${JSON.stringify(payload)}`,
      ].join("\n"),
    );
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, PayloadMismatchError);
    }
    this.name = PayloadMismatchError.name;
  }
}

export class SchemaMismatchError extends Error {
  constructor(
    public topicId: TopicId,
    public jsonSchema: JsonSchema,
    public incomingJsonSchema: unknown,
  ) {
    super(
      [
        `The topic [${topicId}] has been registered with a different schema.`,
        `Expected:${JSON.stringify(jsonSchema)},`,
        `Received:${JSON.stringify(incomingJsonSchema)}`,
      ].join("\n"),
    );
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SchemaMismatchError);
    }
    this.name = SchemaMismatchError.name;
  }
}

export class TopicNotFoundError extends Error {
  constructor(public topicId: TopicId) {
    super(`The topic [${topicId}] is not found.`);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TopicNotFoundError);
    }
    this.name = TopicNotFoundError.name;
  }
}
