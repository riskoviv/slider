class EventEmitter implements IEventEmitter {
  private events: EventsStorage = {};

  on<T>(event: EventName, handler: EventHandler<T>): this {
    if (this.events[event] === undefined) {
      this.events[event] = new Set<EventHandler<T>>();
    }
    this.events[event]?.add(handler);
    return this;
  }

  protected emit<T>(event: EventName, arg: T): void {
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
