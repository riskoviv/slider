class EventEmitter implements IEventEmitter {
  private events: EventsStorage = {};

  on(event: EventNames, listener: () => void): this {
    if (this.events[event] === undefined) {
      this.events[event] = new Set<() => void>();
    }
    this.events[event]?.add(listener);
    return this;
  }

  off(event: EventNames, listener?: () => void): this {
    if (listener !== undefined) {
      this.events[event]?.delete(listener);
    } else {
      delete this.events[event];
    }
    return this;
  }

  protected emit(event: EventNames, arg?: object | number | boolean): void {
    try {
      const emitError = new Error();
      emitError.name = 'EmitError';

      if (this.events[event] === undefined) {
        emitError.message = `${event} event is not registered. arg = ${
          typeof arg === 'object'
            ? `{ ${Object.entries(arg).map((entry) => `${entry[0]}: ${entry[1]}`).join(', ')} }`
            : arg
        }`;
        throw emitError;
      }

      this.events[event]?.forEach((listener) => listener(arg));
    } catch (error) {
      console.error(error);
    }
  }
}

export default EventEmitter;
