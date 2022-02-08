class EventEmitter implements IEventEmitter {
  private events: EventsStorage = {};

  on(event: EventName, handler: EventHandler): this {
    if (this.events[event] === undefined) {
      this.events[event] = new Set<EventHandler>();
    }
    this.events[event]?.add(handler);
    return this;
  }

  off(event: EventName, handler?: EventHandler): this {
    if (handler !== undefined) {
      this.events[event]?.delete(handler);
    } else {
      delete this.events[event];
    }
    return this;
  }

  protected emit(event: EventName, arg: OptionsObject): void {
    try {
      const emitError = new Error();
      emitError.name = 'EmitError';

      if (this.events[event] === undefined) {
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
