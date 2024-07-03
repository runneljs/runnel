import type { SubscriptionStore } from "./eventbus/SubscriptionStore";
import type { JsonSchema, TopicId } from "./topic-registration";

export type RunnelGlobals = {
  // Observe when plugins are registered.
  subscriptionStore?: SubscriptionStore;
  // Store schemas so we can validate schema and payload.
  schemaStoreMap?: Map<TopicId, JsonSchema>;
  // For new subscribers which subscribe to a topic already published.
  latestStateStoreMap?: Map<TopicId, unknown>;
};

interface CustomWindow extends Window {
  __runnel: RunnelGlobals;
}
declare const window: CustomWindow;
export type GlobalType = CustomWindow;

export function getGlobal(): GlobalType {
  if (typeof window !== "undefined") {
    return window as unknown as GlobalType;
  }
  if (typeof global !== "undefined") {
    return global as unknown as GlobalType;
  }
  if (typeof self !== "undefined") {
    return self as unknown as GlobalType;
  }
  throw new Error("No global object found. Please create a PR to support it.");
}
