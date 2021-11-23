class EventEmitter implements IEventEmitter {
  events: EventsStorage = {};

  on(evt: EventName, listener: Function): this {
    if (this.events[evt] === undefined) {
      this.events[evt] = [];
    }
    this.events[evt].push(listener);
    return this;
  }

  emit(evt: EventName, arg?: object | number | boolean): void {
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

      this.events[evt].slice().forEach((lsn) => lsn(arg));
    } catch (error) {
      console.error(error);
    }
  }
}

export default EventEmitter;
