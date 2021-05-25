type EventsStorage = {
  [key: string]: Function[];
};

class EventEmitter {
  private events: EventsStorage = {};

  on(evt: string, listener: Function): this {
    if (this.events[evt] === undefined) {
      this.events[evt] = [];
    }
    this.events[evt].push(listener);
    return this;
  }

  protected emit(evt: string, arg?: unknown): void {
    if (this.events[evt] === undefined) {
      console.error(`${evt} event not registered`);
      return;
    }
    this.events[evt].slice().forEach((lsn) => lsn(arg));
  }
}

export default EventEmitter;
