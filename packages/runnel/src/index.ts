import { SubscriptionStore } from "./SubscriptionStore";
import { PayloadMismatchError, SchemaMismatchError } from "./errors";
import { eventBus, type Validator } from "./event-bus";
import { getGlobal } from "./get-global";
import { mapPlugins } from "./map-plugins";
import { createPluginEmitter } from "./plugin-emitter";
import type {
  JsonSchema,
  Plugin,
  PluginScope,
  Subscription,
  TopicId,
} from "./primitive-types";
import { schemaManager, type DeepEqual } from "./schema-manager";
import type { Scope } from "./scope";
import { createGetSynchedPluginStores } from "./sync-plugins";
export { type Plugin };

const SUBSCRIPTION_STORE_VARIABLE_NAME = "runnelSubscriptionStore" as const;
const LATEST_STATE_STORE_VARIABLE_NAME = "runnelLatestStateStore" as const;
const SCHEMA_STORE_VARIABLE_NAME = "runnelSchemaStore" as const;

export { PayloadMismatchError, SchemaMismatchError };
export type { Subscription, TopicId };

export function createEventBus({
  deepEqual,
  payloadValidator,
  scope = getGlobal(),
  pluginMap = new Map<any, Plugin[]>(),
}: {
  deepEqual: DeepEqual;
  payloadValidator: Validator;
  scope?: any;
  pluginMap?: Map<PluginScope, Plugin[]>;
}): ReturnType<typeof eventBus> {
  const _global = scope as Scope;
  _global[SUBSCRIPTION_STORE_VARIABLE_NAME] ??= new SubscriptionStore();
  _global[SCHEMA_STORE_VARIABLE_NAME] ??= new Map<TopicId, JsonSchema>();
  _global[LATEST_STATE_STORE_VARIABLE_NAME] ??= new Map<TopicId, unknown>();

  const pluginStoreMap = mapPlugins(
    _global[SCHEMA_STORE_VARIABLE_NAME],
    pluginMap,
  );

  return eventBus({
    latestStateStore: _global[LATEST_STATE_STORE_VARIABLE_NAME],
    subscriptionStore: _global[SUBSCRIPTION_STORE_VARIABLE_NAME],
    checkSchema: schemaManager(deepEqual, _global[SCHEMA_STORE_VARIABLE_NAME]),
    pluginEmitter: createPluginEmitter(
      createGetSynchedPluginStores(pluginStoreMap, _global),
      _global,
    ),
    payloadValidator,
  });
}
