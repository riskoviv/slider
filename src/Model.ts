/* eslint-disable lines-between-class-members */
/* eslint-disable no-dupe-class-members */
import EventEmitter from './EventEmitter';
import { getFractionalPartSize } from './utils';

class Model extends EventEmitter implements IModel {
  options: SliderOptions;

  allowedValues: number[];

  allowedValuesCount: number;

  fractionalPrecision: number;

  viewValues: ViewValues = {
    positions: { 1: NaN, 2: NaN },
    stepInPercents: NaN,
    penultimatePosition: NaN,
  };

  constructor(options: SliderOptions) {
    super();
    this.options = { ...options };
    this.fractionalPrecision = this.identifyMaxFractionalPrecision();
    this.allowedValues = this.createAllowedValuesArray();
    this.allowedValuesCount = this.getAllowedValuesCount();
    this.fixValues();
  }

  createAllowedValuesArray(): number[] {
    const allowedValues: number[] = [];
    const { minValue, maxValue, stepSize } = this.options;
    for (let value = minValue; value <= maxValue; value += stepSize) {
      allowedValues.push(this.fixValueToPrecision(value));
    }
    if (allowedValues.at(-1) !== maxValue) allowedValues.push(maxValue);

    return allowedValues;
  }

  getOptions(): SliderOptions {
    return { ...this.options };
  }

  getIndexByValueNumber(valueNumber: 1 | 2): number {
    const value = this.options[`value${valueNumber}`];
    return this.getIndexByValue(value);
  }

  getIndexByValue(value: number): number {
    return this.allowedValues.indexOf(value);
  }

  getValueByIndex(index: number): number {
    if (index >= this.allowedValuesCount - 1) return this.options.maxValue;
    if (index <= 0) return this.options.minValue;
    return this.allowedValues[index];
  }

  getPenultimateValue(): number {
    return this.allowedValues.slice(-2)[0];
  }

  getAllowedValuesCount(): number {
    return this.allowedValues.length;
  }

  setVerticalState(isVertical: boolean): void {
    const isBoolean = typeof isVertical === 'boolean';
    const isSameAsCurrent = this.options.isVertical === isVertical;
    const isAllowed = isBoolean && !isSameAsCurrent;
    if (!isAllowed) return;

    this.options.isVertical = isVertical;
    this.emit({ event: 'isVerticalChanged', value: isVertical });
  }

  setInterval(isInterval: boolean): void {
    const isBoolean = typeof isInterval === 'boolean';
    const isSameAsCurrent = this.options.isInterval === isInterval;
    const isAllowed = isBoolean && !isSameAsCurrent;
    if (!isAllowed) return;

    this.options.isInterval = isInterval;

    const { value1Fixed, value2Fixed } = this.fixValues();
    const doEmitValue2Changed = this.options.isInterval
      && (value2Fixed || Number.isNaN(this.viewValues.positions[2]));
    this.emit({
      event: 'isIntervalChanged',
      value: isInterval,
      options: { checkTipsOverlap: !(value1Fixed || doEmitValue2Changed) },
    });

    if (value1Fixed) {
      this.emit({
        event: 'value1Changed',
        value: this.options.value1,
        options: {
          changeTipValue: true,
          checkTipsOverlap: value1Fixed && !doEmitValue2Changed,
        },
      });
    }

    if (doEmitValue2Changed) {
      this.emit({
        event: 'value2Changed',
        value: this.options.value2,
        options: {
          changeTipValue: false,
          checkTipsOverlap: true,
        },
      });
    }
  }

  setShowProgress(showProgressBar: boolean): void {
    const isBoolean = typeof showProgressBar === 'boolean';
    const isSameAsCurrent = this.options.showProgressBar === showProgressBar;
    const isAllowed = isBoolean && !isSameAsCurrent;
    if (!isAllowed) return;

    this.options.showProgressBar = showProgressBar;
    this.emit({ event: 'showProgressChanged', value: showProgressBar });
  }

  setShowTip(showTip: boolean): void {
    const isBoolean = typeof showTip === 'boolean';
    const isSameAsCurrent = this.options.showTip === showTip;
    const isAllowed = isBoolean && !isSameAsCurrent;
    if (!isAllowed) return;

    this.options.showTip = showTip;
    this.emit({ event: 'showTipChanged', value: showTip });
  }

  setShowScale(showScale: boolean): void {
    const isBoolean = typeof showScale === 'boolean';
    const isSameAsCurrent = this.options.showScale === showScale;
    const isAllowed = isBoolean && !isSameAsCurrent;
    if (!isAllowed) return;

    this.options.showScale = showScale;
    this.emit({ event: 'showScaleChanged', value: showScale });
  }

  setStepSize(stepSize: number): void {
    const isFiniteNumber = Number.isFinite(stepSize);
    const isSameAsCurrent = this.options.stepSize === stepSize;
    const isMoreThanRange = stepSize > this.options.maxValue - this.options.minValue;
    const isZero = stepSize === 0;
    const isAllowed = isFiniteNumber && !isSameAsCurrent && !isMoreThanRange && !isZero;
    if (!isAllowed) return;

    this.options.stepSize = stepSize < 0 ? -stepSize : stepSize;
    this.updateValues('stepSizeChanged', this.options.stepSize);
  }

  setMinValue(minValue: number): void {
    const isFiniteNumber = Number.isFinite(minValue);
    const isSameAsCurrent = this.options.minValue === minValue;
    const moreThanMaxMinusStep = minValue > this.options.maxValue - this.options.stepSize;
    const isAllowed = isFiniteNumber && !isSameAsCurrent && !moreThanMaxMinusStep;
    if (!isAllowed) return;

    this.options.minValue = minValue;
    this.updateValues('minValueChanged', minValue, true);
  }

  setMaxValue(maxValue: number): void {
    const isFiniteNumber = Number.isFinite(maxValue);
    const isSameAsCurrent = maxValue === this.options.maxValue;
    const lessThanMinPlusStep = maxValue < this.options.minValue + this.options.stepSize;
    const isAllowed = isFiniteNumber && !isSameAsCurrent && !lessThanMinPlusStep;
    if (!isAllowed) return;

    this.options.maxValue = maxValue;
    this.updateValues('maxValueChanged', maxValue, true);
  }

  setValue1(value: number): void {
    this.setValue(1, value);
  }

  setValue2(value: number): void {
    this.setValue(2, value);
  }

  setValue(number: 1 | 2, value: number, onlySaveValue = false): void {
    const isAllowedNumber = Number.isFinite(value) && [1, 2].includes(number);
    if (!isAllowedNumber) return;

    const valueNumber: 'value1' | 'value2' = `value${number}`;
    const isSameAsCurrent = this.options[valueNumber] === value;
    if (isSameAsCurrent) return;

    this.options[valueNumber] = onlySaveValue ? value : this.fixValue(number, value, true);
    this.emit({
      event: `${valueNumber}Changed`,
      value: this.options[valueNumber],
      options: {
        changeTipValue: true,
        onlySaveValue,
        checkTipsOverlap: this.options.isInterval,
      },
    });
  }

  fixValueToPrecision(value: number, precision = this.fractionalPrecision): number {
    const valueAsFixedString = Number.prototype.toFixed.call(value, precision);
    const valueAsFixedNumber = Number.parseFloat(valueAsFixedString);
    return valueAsFixedNumber;
  }

  subscribe(options: ValueSubscribe | StateSubscribe): void {
    this.eventsSwitch({ options, type: 'subscribe' });
    const { subscriber } = options;
    if (subscriber instanceof HTMLInputElement) {
      Object.defineProperty(subscriber, 'unsubscribe', {
        value: this.unsubscribe.bind(this, subscriber),
        writable: true,
        configurable: true,
      });
    } else if (subscriber instanceof Function) {
      subscriber.unsubscribe = this.unsubscribe.bind(this, subscriber);
    }
  }

  unsubscribe(subscriber: Subscriber): boolean {
    const isHTMLInputElement = subscriber instanceof HTMLInputElement;
    const isFunction = subscriber instanceof Function;
    const isInputElementOrFunction = isHTMLInputElement || isFunction;
    if (!isInputElementOrFunction) return false;

    // eslint-disable-next-line no-param-reassign
    delete subscriber.unsubscribe;

    return this.off(subscriber);
  }

  publicValueMethods: ModelValueMethods = {
    setValue1: this.setValue1.bind(this),
    setValue2: this.setValue2.bind(this),
    setStepSize: this.setStepSize.bind(this),
    setMinValue: this.setMinValue.bind(this),
    setMaxValue: this.setMaxValue.bind(this),
  };

  publicStateMethods: ModelStateMethods = {
    setVerticalState: this.setVerticalState.bind(this),
    setInterval: this.setInterval.bind(this),
    setShowProgress: this.setShowProgress.bind(this),
    setShowTip: this.setShowTip.bind(this),
    setShowScale: this.setShowScale.bind(this),
  };

  publicDataMethods: PluginDataMethods = {
    getOptions: this.getOptions.bind(this),
    subscribe: this.subscribe.bind(this),
    unsubscribe: this.unsubscribe.bind(this),
  };

  private updateValues(eventName: ValueEvent, value: number, ignoreIsFixed = false) {
    this.fractionalPrecision = this.identifyMaxFractionalPrecision();

    this.emit({ event: eventName, value });

    const { value1Fixed, value2Fixed } = this.fixValues();
    const doEmitValue1Changed = ignoreIsFixed || value1Fixed;
    const doEmitValue2Changed = this.options.isInterval
      && (ignoreIsFixed || value2Fixed);

    if (doEmitValue1Changed) {
      this.emit({
        event: 'value1Changed',
        value: this.options.value1,
        options: {
          changeTipValue: true,
          checkTipsOverlap: doEmitValue1Changed && !doEmitValue2Changed,
        },
      });
    }

    if (doEmitValue2Changed) {
      this.emit({
        event: 'value2Changed',
        value: this.options.value2,
        options: {
          changeTipValue: true,
          checkTipsOverlap: true,
        },
      });
    }
  }

  private isValueAllowed(value: number): boolean {
    return this.allowedValues.includes(value);
  }

  private getSecondValue(): number {
    return this.allowedValues[1];
  }

  private fixValues() {
    const { value1, value2 } = this.options;
    if (!this.isValueAllowed(this.options.value1)) {
      this.options.value1 = this.fixValue(1, this.options.value1);
    }

    if (this.options.isInterval) {
      if (!this.isValueAllowed(this.options.value2)) {
        this.options.value2 = this.fixValue(2, this.options.value2);
      }

      if (this.options.value1 === this.options.value2) {
        const warnMsgStart = `Warning: difference between value1 and value2 is less than stepSize (${this.options.stepSize}) in plugin options and leads to equality of value1 and value2.`;
        const warnMsgEnd = '\nPlease check values that you passed to plugin options.';

        if (this.options.value1 === this.options.maxValue) {
          this.options.value1 = this.getPenultimateValue();
          console.warn(`${warnMsgStart} Also value1 was too close to maxValue, so value1 is now set to previous closest allowed value.${warnMsgEnd}`);
        } else if (this.options.value2 === this.options.minValue) {
          this.options.value2 = this.getSecondValue();
          console.warn(`${warnMsgStart} Also value2 was too close to minValue, so value2 is now set to next closest allowed value.${warnMsgEnd}`);
        } else {
          const value1Index = this.getIndexByValueNumber(1);
          this.options.value2 = this.getValueByIndex(value1Index + 1);
          console.warn(`${warnMsgStart} value2 is now set to next closest allowed value.${warnMsgEnd}`);
        }
      } else if (this.options.value2 < this.options.value1) {
        [this.options.value1, this.options.value2] = [this.options.value2, this.options.value1];
        console.warn('value1 & value2 were swapped');
      }
    }

    return {
      value1Fixed: value1 !== this.options.value1,
      value2Fixed: value2 !== this.options.value2,
    };
  }

  private fixValue(number: 1 | 2, value: number, checkIsAllowed = false): number {
    const fixReasons = [];
    let fixedValue = value;
    const needToFindAllowed = !checkIsAllowed || !this.isValueAllowed(fixedValue);
    if (needToFindAllowed) {
      fixedValue = this.findClosestAllowedValue(fixedValue);
      fixReasons.push('to satisfy stepSize or keep in range');
    }

    if (this.options.isInterval) {
      if (number === 1) {
        if (fixedValue >= this.options.value2) {
          if (this.options.value2 === this.options.maxValue) {
            fixedValue = this.getPenultimateValue();
          } else {
            fixedValue = this.getValueByIndex(this.getIndexByValueNumber(2) - 1);
          }
          fixReasons.push('to make it less than value2');
        }
      } else if (fixedValue <= this.options.value1) {
        fixedValue = this.getValueByIndex(this.getIndexByValueNumber(1) + 1);
        fixReasons.push('to make it more than value1');
      }
    }

    fixedValue = this.fixValueToPrecision(fixedValue);

    if (fixedValue !== value) {
      console.warn(`Note: value${number} (${value}) is changed to ${fixedValue} ${fixReasons.join(' and ')}.`);
    }
    return fixedValue;
  }

  private findClosestAllowedValue(initialValue: number): number {
    const min = this.options.minValue;
    const step = this.options.stepSize;
    const index = Math.round((initialValue - min) / step);
    const closestValue = this.getValueByIndex(index);
    return closestValue;
  }

  private identifyMaxFractionalPrecision(): number {
    const fractionSizes = [
      this.options.stepSize,
      this.options.minValue,
      this.options.maxValue,
    ].map((value) => getFractionalPartSize(value));
    return Math.max(...fractionSizes);
  }
}

export default Model;
