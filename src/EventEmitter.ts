class EventEmitter implements IEventEmitter {
  private events: EventsStorage = {};

  on(evt: EventNames, listener: Function): this {
    if (this.events[evt] === undefined) {
      this.events[evt] = new Set<Function>();
    }
    this.events[evt]?.add(listener);
    return this;
  }

  protected emit(evt: EventNames, arg?: object | number | boolean): void {
    try {
      const emitError = new Error();
      emitError.name = 'EmitError';

      if (this.events[evt] === undefined) {
        emitError.message = `${evt} event is not registered. arg = ${
          typeof arg === 'object'
            ? `{ ${Object.entries(arg).map((entry) => `${entry[0]}: ${entry[1]}`).join(', ')} }`
            : arg
        }`;
        throw emitError;
      }

      this.events[evt]?.forEach((lsn) => lsn(arg));
    } catch (error) {
      console.error(error);
    }
  }
}

export default EventEmitter;
