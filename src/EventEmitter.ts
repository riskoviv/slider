abstract class EventEmitter implements IEventEmitter {
  private events: EventsStorage = {};

  on<Value, Options>(
    event: EventName | ViewEventName,
    handler: EventHandler<Value, Options>,
  ): this {
    if (this.events[event] === undefined) {
      this.events[event] = new Set<EventHandler<Value, Options>>();
    }
    this.events[event]?.add(handler);
    return this;
  }

  off<argumentType>(event: EventName | ViewEventName, handler?: EventHandler<argumentType>): this {
    if (handler !== undefined) {
      this.events[event]?.delete(handler);
    } else {
      delete this.events[event];
    }
    return this;
  }

  protected emit<Value, Options>(
    event: EventName | ViewEventName,
    changedValue: Value,
    options?: Options,
  ): void {
    try {
      if (this.events[event] === undefined) {
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

      this.events[event]?.forEach(
        (handler: EventHandler<Value, Options>) => handler(changedValue, options),
      );
    } catch (error) {
      console.error(error);
    }
  }
}

export default EventEmitter;
