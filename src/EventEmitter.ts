abstract class EventEmitter implements IEventEmitter {
  private events: EventsStorage = {};

  on<Value, Options>(
    event: EventName | ViewEventName,
    handler: EventHandler<Value, Options>,
    subscriber: Subscriber<Value, Options> = 'Presenter',
  ): this {
    if (this.events[event] === undefined) {
      this.events[event] = new Map<Subscriber<Value, Options>, EventHandler<Value, Options>>();
    }
    this.events[event]?.set(subscriber, handler);
    return this;
  }

  off<Value, Options>(
    event: EventName | ViewEventName,
    subscriber: Subscriber<Value, Options>,
  ): this {
    if (this.events[event] === undefined) return this;
    if (!this.events[event]?.has(subscriber)) return this;

    this.events[event]?.delete(subscriber);
    console.log(`${subscriber} was unsubscribed from ${event}`);
    return this;
  }

  protected emit<Value, Options>(
    event: EventName | ViewEventName,
    changedValue: Value,
    options?: Options,
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
        (handler: EventHandler<Value, Options>) => {
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
