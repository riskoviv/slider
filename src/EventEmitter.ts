/* eslint-disable no-dupe-class-members */
/* eslint-disable lines-between-class-members */
abstract class EventEmitter implements IEventEmitter {
  private valueHandlers: ValueHandlers = {};

  private stateHandlers: StateHandlers = {};

  private viewHandlers: ViewHandlers = {};

  on(options: ValueOn | StateOn | ViewOn): this {
    this.eventsSwitch({ options, type: 'on' });
    return this;
  }

  protected eventsSwitch({ options, type }: {
    options: ValueOn | StateOn | ViewOn,
    type: 'on',
  } | {
    options: ValueEmit | StateEmit | ViewEmit,
    type: 'emit',
  } | {
    options: ValueSubscribe | StateSubscribe,
    type: 'subscribe',
  }): void {
    switch (options.event) {
      case 'value1Changed':
      case 'value2Changed':
      case 'minValueChanged':
      case 'maxValueChanged':
      case 'stepSizeChanged':
        switch (type) {
          case 'on': this.valueOn(options); break;
          case 'emit': this.valueEmit(options); break;
          case 'subscribe': this.valueSubscribe(options); break;
          default: break;
        }
        break;
      case 'isVerticalChanged':
      case 'isIntervalChanged':
      case 'showProgressChanged':
      case 'showTipChanged':
      case 'showScaleChanged':
        switch (type) {
          case 'on': this.stateOn(options); break;
          case 'emit': this.stateEmit(options); break;
          case 'subscribe': this.stateSubscribe(options); break;
          default: break;
        }
        break;
      case 'sliderPointerDown':
        switch (type) {
          case 'on': this.sliderPointerDownOn(options); break;
          case 'emit': this.sliderPointerDownEmit(options); break;
          default: break;
        }
        break;
      case 'scaleValueSelect':
        switch (type) {
          case 'on': this.scaleValueSelectOn(options); break;
          case 'emit': this.scaleValueSelectEmit(options); break;
          default: break;
        }
        break;
      default: break;
    }
  }

  protected valueOn({ event, handler, subscriber }: ValueOn): void {
    if (this.valueHandlers[event] === undefined) {
      this.valueHandlers[event] = new Map<
        UnsubHTMLInputElement | ValueHandler | undefined, ValueHandler
      >();
    }
    this.valueHandlers[event]?.set(subscriber, handler);
  }

  protected stateOn({ event, handler, subscriber }: StateOn): void {
    if (this.stateHandlers[event] === undefined) {
      this.stateHandlers[event] = new Map<
        UnsubHTMLInputElement | StateHandler | undefined, StateHandler
      >();
    }
    this.stateHandlers[event]?.set(subscriber, handler);
  }

  private sliderPointerDownOn({ event, handler }: SliderPointerDownOn): void {
    if (this.viewHandlers[event] === undefined) {
      this.viewHandlers[event] = new Map<undefined, SliderPointerDownHandler>();
    }
    this.viewHandlers[event]?.set(undefined, handler);
  }

  private scaleValueSelectOn({ event, handler }: ScaleValueSelectOn): void {
    if (this.viewHandlers[event] === undefined) {
      this.viewHandlers[event] = new Map<undefined, ScaleValueSelectHandler>();
    }
    this.viewHandlers[event]?.set(undefined, handler);
  }

  protected off(subscriber: Subscriber): boolean {
    return [this.valueHandlers, this.stateHandlers].some(
      (handlersStorage) => (Object.values(handlersStorage)
        .reduce<boolean>((mapUnsubscribeState, handlersMap) => {
          const foundSubscriberInMap = [...handlersMap.keys()]
            .reduce<boolean>((subscriberUnsubscribeState, registeredSubscriber) => {
              if (registeredSubscriber === subscriber) {
                handlersMap.delete(registeredSubscriber);
                return true;
              }
              return subscriberUnsubscribeState;
            }, false);
          if (foundSubscriberInMap) return true;
          return mapUnsubscribeState;
        }, false)),
    );
  }

  protected emit(options: ValueEmit): void;
  protected emit(options: StateEmit): void;
  protected emit(options: ViewEmit): void;
  protected emit(options: ValueEmit | StateEmit | ViewEmit): void {
    this.eventsSwitch({ options, type: 'emit' });
  }

  private valueEmit({ event, value, options }: ValueEmit): void {
    const eventMap = this.valueHandlers[event];
    if (eventMap === undefined) {
      EventEmitter.throwEmitError(event, value);
      return;
    }

    [...eventMap.values()].forEach((handler) => {
      if (options !== undefined) {
        handler(value, options);
      } else {
        handler(value);
      }
    });
  }

  private stateEmit({ event, value, options }: StateEmit) {
    const eventMap = this.stateHandlers[event];
    if (eventMap === undefined) {
      EventEmitter.throwEmitError(event, value);
      return;
    }

    [...eventMap.values()].forEach((handler) => {
      if (options !== undefined) {
        handler(value, options);
      } else {
        handler(value);
      }
    });
  }

  private sliderPointerDownEmit({ event, value }: SliderPointerDownEmit) {
    const eventMap = this.viewHandlers[event];
    if (eventMap === undefined) {
      EventEmitter.throwEmitError(event, value);
      return;
    }

    [...eventMap.values()].forEach((handler) => {
      handler(value);
    });
  }

  private scaleValueSelectEmit({ event, value }: ScaleValueSelectEmit) {
    const eventMap = this.viewHandlers[event];
    if (eventMap === undefined) {
      EventEmitter.throwEmitError(event, value);
      return;
    }

    [...eventMap.values()].forEach((handler) => {
      handler(value);
    });
  }

  private static throwEmitError<Event, Value>(event: Event, value: Value) {
    const emitError = new Error();
    emitError.name = 'EmitError';
    emitError.message = `${event} event is not registered. arg = ${typeof value === 'object' && value !== null
      ? `{ ${Object.entries(value).map(
        ([argKey, argValue]) => `${argKey}: ${argValue}`,
      ).join(', ')} }`
      : value}`;
    console.error(emitError);
  }

  private valueSubscribe({ event, subscriber }: ValueSubscribe): void {
    const makeNumericInputElementUpdater = (inputElement: UnsubHTMLInputElement) => {
      const subscribedElement = inputElement;
      const updateNumericInput = (value: number) => {
        subscribedElement.value = String(value);
        const inputEvent = new InputEvent('input');
        subscribedElement.dispatchEvent(inputEvent);
      };
      return updateNumericInput;
    };

    const subscriberIsInputTypeNumber = subscriber instanceof HTMLInputElement
      && subscriber.type === 'number';
    if (subscriberIsInputTypeNumber) {
      this.valueOn({ event, handler: makeNumericInputElementUpdater(subscriber), subscriber });
    } else if (subscriber instanceof Function) {
      this.valueOn({ event, handler: subscriber, subscriber });
    }
  }

  private stateSubscribe({ event, subscriber }: StateSubscribe): void {
    const makeCheckboxElementUpdater = (inputElement: UnsubHTMLInputElement) => {
      const subscribedElement = inputElement;
      const updateCheckbox = (value: boolean) => {
        subscribedElement.checked = value;
        const changeEvent = new InputEvent('change');
        subscribedElement.dispatchEvent(changeEvent);
      };
      return updateCheckbox;
    };

    const subscriberIsInputTypeCheckbox = subscriber instanceof HTMLInputElement
      && subscriber.type === 'checkbox';
    if (subscriberIsInputTypeCheckbox) {
      this.stateOn({ event, handler: makeCheckboxElementUpdater(subscriber), subscriber });
    } else if (subscriber instanceof Function) {
      this.stateOn({ event, handler: subscriber, subscriber });
    }
  }
}

export default EventEmitter;
