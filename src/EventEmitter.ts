type EventsStorage = {
  [event in EventName]?: Function[];
};

class EventEmitter {
  private events: EventsStorage = {};

  on(evt: EventName, listener: Function): this {
    if (this.events[evt] === undefined) {
      this.events[evt] = [];
    }
    this.events[evt].push(listener);
    return this;
  }

  protected emit(evt: EventName, arg?: unknown): void {
    try {
      if (this.events[evt] === undefined) {
        const emitError = new Error(`${evt} event is not registered`);
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
