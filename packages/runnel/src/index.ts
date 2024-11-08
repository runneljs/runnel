/**
 * This file is the entry file of the runnel.
 * @module
 */

import { getGlobal } from "./get-global";
import { createLogger } from "./logger";

type TopicId = string;
type Unsubscribe = () => void;

type Runnel<S> = {
  registerTopic: <T extends keyof S & string>(
    topicId: T,
  ) => {
    subscribe: (subscriber: (payload: S[T]) => void) => Unsubscribe;
    publish: (payload: S[T]) => void;
  };
};

/**
 * Create a runnel instance. Please provide the schemas of the topics to type the payload.
 * @returns A runnel instance composed of `registerTopic`.
 *
 * @example
 * ```ts
 * type Schemas = {
 *   str: string;
 *   num: number;
 *   foobar: {
 *     foo: string;
 *     bar: string;
 *   };
 * }
 * const runnel = runnel<Schemas>();
 *
 * const strTopic = runnel.registerTopic("str");
 * strTopic.publish("test - this is a string");
 * strTopic.subscribe((payload) => {
 *   typeof payload === "string"; // true
 * });
 *
 * const numTopic = runnel.registerTopic("num");
 * numTopic.publish(123);
 * numTopic.subscribe((payload) => {
 *   typeof payload === "number"; // true
 * });
 *
 * const foobarTopic = runnel.registerTopic("foobar");
 * foobarTopic.publish({ foo: "some foo", bar: "some bar" });
 * foobarTopic.subscribe((payload) => {
 *   typeof payload.foo === "string"; // true
 *   typeof payload.bar === "string"; // true
 * });
 * ```
 */
export function runnel<S>(): Runnel<S> {
  const globalVar = getGlobal();
  globalVar.__runnel ??= {};
  const latestMap = (globalVar.__runnel.latestStateStoreMap ??= new Map<
    TopicId,
    unknown
  >());

  // T as TopicId, P as Payload, S as Schemas
  function registerTopic<T extends keyof S & string>(topicId: T) {
    const logger = createLogger<S>(topicId);
    logger.onCreateTopic();

    type P = S[T];
    return {
      subscribe: (subscriber: (payload: P) => void): Unsubscribe => {
        const eventListener = (event: Event) => {
          const { detail } = event as CustomEvent;
          subscriber(detail);
        };
        globalVar.addEventListener(eventName(topicId), eventListener);
        logger.onAddEventListener();

        const latestPayload = latestMap.get(topicId) as P | undefined;
        if (latestPayload) {
          // As soon as a new subscriber is added, the subscriber should receive the latest payload.
          subscriber(latestPayload);
          logger.onPostMessage();
        }

        return function unsubscribe() {
          globalVar.removeEventListener(eventName(topicId), eventListener);
          logger.onRemoveEventListener();
        };
      },
      publish: (payload: P) => {
        globalVar.dispatchEvent(
          new CustomEvent(eventName(topicId), { detail: payload }),
        );
        logger.onPostMessage();
        // Preserve the latest payload with the topicId.
        // So the newly registered topics can get the latest payload when they subscribe.
        latestMap.set(topicId, payload);
      },
    };
  }
  return { registerTopic };
}

function eventName(topicId: TopicId) {
  return `runnel:${topicId}`;
}
