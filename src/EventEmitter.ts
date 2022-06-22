abstract class EventEmitter implements IEventEmitter {
  private events: EventsStorage = {};

  on<argumentType>(event: EventName | ViewEventName, handler: EventHandler<argumentType>): this {
    if (this.events[event] === undefined) {
      this.events[event] = new Set<EventHandler<argumentType>>();
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

  protected emit<argumentType>(event: EventName | ViewEventName, arg?: argumentType): void {
    try {
      if (this.events[event] === undefined) {
        const emitError = new Error();
        emitError.name = 'EmitError';
        emitError.message = `${event} event is not registered. arg = ${
          typeof arg === 'object'
            ? `{ ${Object.entries(arg).map(
              ([key, value]) => `${key}: ${value}`,
            ).join(', ')} }`
            : arg
        }`;
        throw emitError;
      }

      this.events[event]?.forEach((handler) => handler(arg));
    } catch (error) {
      console.error(error);
    }
  }
}

export default EventEmitter;
