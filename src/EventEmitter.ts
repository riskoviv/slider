abstract class EventEmitter implements IEventEmitter {
  private events: EventsStorage = {};

  on<Value>(
    event: SliderEvent,
    handler: EventHandler<Value>,
    subscriber?: Subscriber<Value>,
  ): this {
    if (this.events[event] === undefined) {
      this.events[event] = new Map<Subscriber<Value>, EventHandler<Value>>();
    }

    this.events[event]?.set(subscriber, handler);
    return this;
  }

  off<Value>(subscriber: Subscriber<Value>): boolean {
    let isUnsubscribed = false;
    Object.values(this.events).forEach((eventMap) => {
      [...eventMap.keys()].forEach((eventSubscriber) => {
        if (eventSubscriber === subscriber) {
          eventMap.delete(eventSubscriber);
          isUnsubscribed = true;
        }
      });
    });

    return isUnsubscribed;
  }

  protected emit<Value>(
    event: SliderEvent,
    changedValue: Value,
    options?: SetValueEventOptions,
  ): void {
    try {
      const eventMap = this.events[event];
      if (eventMap === undefined) {
        const emitError = new Error();
        emitError.name = 'EmitError';
        emitError.message = `${event} event is not registered. arg = ${
          typeof changedValue === 'object'
            ? `{ ${Object.entries(changedValue).map(
              ([key, value]) => `${key}: ${value}`,
            ).join(', ')} }`
            : changedValue
        }`;
        throw emitError;
      }

      [...eventMap.values()].forEach(
        (handler: EventHandler<Value>) => {
          if (options) handler(changedValue, options);
          else handler(changedValue);
        },
      );
    } catch (error) {
      console.error(error);
    }
  }
}

export default EventEmitter;
