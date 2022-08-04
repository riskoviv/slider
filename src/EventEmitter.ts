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
      this.valueHandlers[event] = new Map<ValueSubscriber, ValueHandler>();
    }
    this.valueHandlers[event]?.set(subscriber, handler);
  }

  protected stateOn({ event, handler, subscriber }: StateOn): void {
    if (this.stateHandlers[event] === undefined) {
      this.stateHandlers[event] = new Map<StateSubscriber, StateHandler>();
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
    type ModelHandlersMap = Map<ValueSubscriber | StateSubscriber, ValueHandler | StateHandler>;
    const modelHandlers = [this.valueHandlers, this.stateHandlers];
    let isSubscriberDeleted = false;
    modelHandlers.forEach((handlersStorage) => {
      const handlersMaps: ModelHandlersMap[] = Object.values(handlersStorage);
      const continueToSearchForSubscriber = (idx: number) => (
        isSubscriberDeleted === false && idx < handlersMaps.length
      );
      for (let mapIdx = 0; continueToSearchForSubscriber(mapIdx); mapIdx += 1) {
        const currentMap = handlersMaps[mapIdx];
        if (currentMap.has(subscriber)) {
          isSubscriberDeleted = currentMap.delete(subscriber);
        }
      }
    });
    return isSubscriberDeleted;
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
    const valueHandlers = [...eventMap.values()];
    if (options === undefined) {
      valueHandlers.forEach((handler) => {
        handler(value);
      });
    } else {
      valueHandlers.forEach((handler) => {
        handler(value, options);
      });
    }
  }

  private stateEmit({ event, value, options }: StateEmit) {
    const eventMap = this.stateHandlers[event];
    if (eventMap === undefined) {
      EventEmitter.throwEmitError(event, value);
      return;
    }

    const stateHandlers = [...eventMap.values()];
    if (options === undefined) {
      stateHandlers.forEach((handler) => {
        handler(value);
      });
    } else {
      stateHandlers.forEach((handler) => {
        handler(value, options);
      });
    }
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
    const emitValueIsObject = typeof value === 'object' && value !== null;
    const emitValueAsString = emitValueIsObject
      ? `{ ${Object.entries(value).map(
        ([argKey, argValue]) => `${argKey}: ${argValue}`,
      ).join(', ')} }`
      : value;
    emitError.message = `${event} event is not registered. value = ${emitValueAsString}`;
    console.error(emitError);
  }

  private valueSubscribe({ event, subscriber }: ValueSubscribe): void {
    const makeNumericInputElementUpdater = (inputElement: UnsubHTMLInputElement) => {
      const subscribedElement = inputElement;
      const inputEvent = new InputEvent('input');
      Object.defineProperty(inputEvent, 'isSubscribeSet', { value: true });
      const updateNumericInput = (value: number) => {
        subscribedElement.value = String(value);
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
      const changeEvent = new InputEvent('change');
      Object.defineProperty(changeEvent, 'isSubscribeSet', { value: true });
      const updateCheckbox = (value: boolean) => {
        subscribedElement.checked = value;
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
