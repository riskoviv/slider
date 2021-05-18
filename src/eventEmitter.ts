type EventsStorage = {
  [key: string]: Function[];
};

class EventEmitter {
  private events: EventsStorage = {};

  protected on(evt: string, listener: Function): EventEmitter {
    (this.events[evt] ? this.events[evt] : this.events[evt] = []).push(listener);
    return this;
  }

  protected emit(evt: string, arg: string | number): void {
    (this.events[evt] || []).slice().forEach((lsn) => lsn(arg));
  }
}

export default EventEmitter;
