import { SubscriptionStore } from "./SubscriptionStore";
import { PayloadMismatchError, SchemaMismatchError } from "./errors";
import { eventBus, type Validator } from "./event-bus";
import { mapPlugins } from "./map-plugins";
import type {
  JsonSchema,
  Plugin,
  PluginScope,
  Scope,
  Subscription,
  TopicId,
} from "./primitive-types";
import { createPluginEventChain, createRunPlugins } from "./run-plugins";
import { schemaManager, type DeepEqual } from "./schema-manager";
export { type Plugin };

const SUBSCRIPTION_STORE_VARIABLE_NAME =
  "mfeEventBusSubscriptionStore" as const;
const LATEST_STATE_STORE_VARIABLE_NAME = "mfeEventBusLatestStateStore" as const;
const SCHEMA_STORE_VARIABLE_NAME = "mfeEventBusSchemaStore" as const;

export { PayloadMismatchError, SchemaMismatchError };
export type { Subscription, TopicId };

export function createEventBus({
  deepEqual,
  payloadValidator,
  scope = getGlobal(),
  pluginMap = new Map(),
}: {
  deepEqual: DeepEqual;
  payloadValidator: Validator;
  scope?: Scope;
  pluginMap?: Map<PluginScope, Plugin[]>;
}): ReturnType<typeof eventBus> {
  const _global = scope;
  _global[SCHEMA_STORE_VARIABLE_NAME] ??= new Map<TopicId, JsonSchema>();
  _global[SUBSCRIPTION_STORE_VARIABLE_NAME] ??= new SubscriptionStore();
  _global[LATEST_STATE_STORE_VARIABLE_NAME] ??= new Map<TopicId, unknown>();

  const pluginStoreMap = mapPlugins(
    _global[SCHEMA_STORE_VARIABLE_NAME],
    pluginMap,
  );

  return eventBus({
    latestStateStore: _global[LATEST_STATE_STORE_VARIABLE_NAME],
    checkSchema: schemaManager(deepEqual, _global[SCHEMA_STORE_VARIABLE_NAME]),
    subscriptionStore: _global[SUBSCRIPTION_STORE_VARIABLE_NAME],
    runPlugins: createRunPlugins(pluginStoreMap, _global),
    pluginEventChain: createPluginEventChain(pluginStoreMap, _global),
    payloadValidator,
  });
}

function getGlobal() {
  if (typeof window !== "undefined") {
    return window;
  }
  if (typeof global !== "undefined") {
    return global;
  }
  if (typeof self !== "undefined") {
    return self;
  }
  throw new Error("No global object found. Please create a PR to support it.");
}

export default createEventBus;
