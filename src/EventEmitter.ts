class EventEmitter implements IEventEmitter {
  private events: EventsStorage = {};

  on<T>(event: EventName, handler: EventHandler<T>): this {
    if (this.events[event] === undefined) {
      this.events[event] = new Set<EventHandler<T>>();
    }
    this.events[event]?.add(handler);
    return this;
  }

  off<T>(event: EventName, handler?: EventHandler<T>): this {
    if (handler !== undefined) {
      this.events[event]?.delete(handler);
    } else {
      delete this.events[event];
    }
    return this;
  }

  protected emit<T>(event: EventName, arg: T): void {
    try {
      if (this.events[event] === undefined) {
        const emitError = new Error();
        emitError.name = 'EmitError';
        emitError.message = `${event} event is not registered. arg = { ${Object.entries(arg).map((entry) => `${entry[0]}: ${entry[1]}`).join(', ')} }`;
        throw emitError;
      }

      this.events[event]?.forEach((handler) => handler(arg));
    } catch (error) {
      console.error(error);
    }
  }
}

export default EventEmitter;
