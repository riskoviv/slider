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
      if (this.events[evt] === undefined) {
        const emitError = new Error(`${evt} event is not registered. arg = ${
          typeof arg === 'object' ? Object.entries(arg).map((entry) => `${entry[0]}: ${entry[1]}`).join(', ') : arg
        }`);
        emitError.name = 'EmitError';
        throw emitError;
      }
      this.events[evt].slice().forEach((lsn) => lsn(arg));
    } catch (e) {
      console.error(e);
    }
  }
}

export default EventEmitter;
