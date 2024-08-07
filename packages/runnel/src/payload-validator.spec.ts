import { createPayloadValidator } from "./payload-validator";

describe("payloadValidator", () => {
  test("should throw error if payload mismatch", () => {
    const validator = createPayloadValidator(() => () => false);
    expect(() => validator("topicId", { type: "string" }, 123)).toThrow(
      'Invalid payload for the topic [topicId].\nPlease make sure the payload matches the schema.\nJSON Schema:{"type":"string"}\nPayload:123',
    );
  });

  test("should not throw error if payload match", () => {
    const validator = createPayloadValidator(() => () => true);
    expect(() => validator("topicId", { type: "string" }, "123")).not.toThrow();
  });
});
