import { afterEach, beforeEach, describe, expect, jest, test } from "bun:test";
import deepEqual from "deep-equal";
import { createPlugin } from "./index";

describe("event-bus-metric-plugin", () => {
  describe("subscribe", () => {
    let callback: jest.Mock;
    let plugin: ReturnType<typeof createPlugin>["plugin"];
    let observer: ReturnType<typeof createPlugin>["observer"];

    beforeEach(() => {
      let result = createPlugin(deepEqual);
      plugin = result.plugin;
      observer = result.observer;
      callback = jest.fn();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    test("should call callback with metrics on subscribe", () => {
      observer.subscribe(callback);
      plugin.onCreateSubscribe("topic1", {
        type: "number",
      });
      expect(callback).toHaveBeenCalledWith({
        topic1: {
          onCreateSubscribe: 1,
          onCreatePublish: 0,
          schema: { type: "number" },
          publish: [],
          subscribe: [],
        },
      });
    });

    test("should call callback with metrics on publish", () => {
      observer.subscribe(callback);
      plugin.onCreatePublish("topic1", {
        type: "number",
      });
      expect(callback).toHaveBeenCalledWith({
        topic1: {
          onCreateSubscribe: 0,
          onCreatePublish: 1,
          schema: { type: "number" },
          publish: [],
          subscribe: [],
        },
      });
    });
  });
});
