type JsonSchema = object;
type UUID = string;
type TopicName = string;

export function createEventBus(
  deepEqual: (value: JsonSchema, other: JsonSchema) => boolean,
) {
  function eventBus() {
    const subscriptionMap = new Map<
      TopicName,
      { schema: JsonSchema; subscribers: Map<UUID, <P>(payload: P) => void> }
    >();

    type SchemaInfo<T> = {
      payloadValidator: (payload: T) => boolean;
      jsonSchema: JsonSchema;
    };
    function registerTopic<T>(
      topicName: TopicName,
      { payloadValidator, jsonSchema }: SchemaInfo<T>,
    ) {
      const { schema, subscribers } = subscriptionMap.get(topicName) || {
        schema: jsonSchema,
        subscribers: new Map<UUID, <T>(payload: T) => void>(),
      };
      if (!deepEqual(jsonSchema, schema)) {
        throw new Error(
          "Invalid schema. The provided schema is not valid. Please make sure you gave the same schema as other subscribers'.",
        );
      }
      subscriptionMap.set(topicName, { schema, subscribers });

      return {
        subscribe: (callback: <P = T>(payload: P) => void) => {
          const { schema, subscribers } = subscriptionMap.get(topicName)!;
          const uuid = crypto.randomUUID();
          subscribers.set(uuid, callback);
          subscriptionMap.set(topicName, {
            schema,
            subscribers,
          });
          return function unsubscribe() {
            const { schema, subscribers } = subscriptionMap.get(topicName)!;
            subscribers.delete(uuid);
            subscriptionMap.set(topicName, {
              schema,
              subscribers,
            });
          };
        },
        publish: (payload: T) => {
          if (!payloadValidator(payload)) {
            throw new Error("Invalid data: The published data is not valid.");
          }
          subscriptionMap.get(topicName)?.subscribers.forEach((callback) => {
            callback(payload);
          });
        },
      };
    }

    function unregisterTopic(topicName: TopicName) {
      subscriptionMap.delete(topicName);
    }

    function unregisterAllTopics() {
      subscriptionMap.clear();
    }

    return { registerTopic, unregisterTopic, unregisterAllTopics };
  }
  const _global = getGlobal() as any;
  _global.mfeEventBus ??= eventBus();
  return _global.mfeEventBus as ReturnType<typeof eventBus>;
}

function getGlobal() {
  if (typeof window !== "undefined") {
    return window;
  }
  if (typeof global !== "undefined") {
    return global;
  }
  throw new Error("No global object found. Please create a PR to support it.");
}
