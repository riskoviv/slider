import EventEmitter from './EventEmitter';

class Model extends EventEmitter implements IModel {
  allowedValuesCount: number;

  fractionalPrecision: number;

  viewValues: ViewValues = {
    positions: { 1: 0, 2: 100 },
    stepInPercents: 10,
    halfStepInPercents: 5,
  };

  constructor(public options: IPluginOptions) {
    super();
    this.allowedValuesCount = Math.ceil(
      (options.maxValue - options.minValue) / options.stepSize,
    ) + 1;
    this.fractionalPrecision = this.identifyMaxFractionalPrecision();
    this.fixValues();
  }

  // debug method
  getOptions(): IPluginOptions {
    return this.options;
  }

  getStateOptions(): IPluginStateOptions {
    const stateOptions = {
      isInterval: this.options.isInterval,
      isVertical: this.options.isVertical,
      showTip: this.options.showTip,
      showScale: this.options.showScale,
      showProgressBar: this.options.showProgressBar,
    };
    return stateOptions;
  }

  getIndexByValueNumber(valueNumber: 1 | 2): number {
    return (this.options[`value${valueNumber}`] - this.options.minValue) / this.options.stepSize;
  }

  getIndexByValue(value: number): number {
    return (value - this.options.minValue) / this.options.stepSize;
  }

  getValueByIndex(index: number): number {
    return this.options.minValue + this.options.stepSize * index;
  }

  setStepSize(stepSize: number): void {
    this.options.stepSize = stepSize;
    this.emit('stepSizeChanged');
  }

  setValue(number: 1 | 2, value: number): void {
    const valueNumber: 'value1' | 'value2' = `value${number}`;
    this.options[valueNumber] = this.fixValue(number, value);

    this.emit('valueChanged', {
      number,
      value: this.options[valueNumber],
    });
  }

  setVerticalState(isVertical: boolean): void {
    this.options.isVertical = isVertical;
    this.emit('isVerticalChanged', isVertical);
  }

  setInterval(isInterval: boolean): void {
    this.options.isInterval = isInterval;
    this.fixValues();
    this.emit('isIntervalChanged', isInterval);
    this.emit('valueChanged', {
      number: 1,
      value: this.options.value1,
    });
    this.emit('valueChanged', {
      number: 2,
      value: this.options.value2,
    });
  }

  publicMethods: IPluginPublicMethods = {
    debug: {
      getOptions: this.getOptions.bind(this),
    },
    setStepSize: this.setStepSize.bind(this),
    setValue: this.setValue.bind(this),
    setVerticalState: this.setVerticalState.bind(this),
    setInterval: this.setInterval.bind(this),
  }

  private isValueAllowed(value: number): boolean {
    return (value - this.options.minValue) % this.options.stepSize === 0;
  }

  private getPenultimateValue(): number {
    return this.options.minValue + this.options.stepSize * (this.allowedValuesCount - 2);
  }

  private getSecondValue(): number {
    return this.options.minValue + this.options.stepSize;
  }

  private fixValues() {
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
        if (this.options.value1 === this.options.maxValue) {
          this.options.value2 = this.options.maxValue;
          this.options.value1 = this.fixValue(1, this.options.value1);
        } else {
          this.options.value2 = this.fixValue(2, this.options.value2);
        }
      }
    }
  }

  private fixValue(number: 1 | 2, value: number): number {
    let fixedValue = value;
    if (value > this.options.maxValue) fixedValue = this.options.maxValue;
    else if (value < this.options.minValue) fixedValue = this.options.minValue;
    else if (!this.isValueAllowed(value)) {
      fixedValue = this.findClosestAllowedValue(value);
    }

    if (this.options.isInterval) {
      if (number === 1) {
        if (fixedValue >= this.options.value2) {
          fixedValue = this.getValueByIndex(this.getIndexByValueNumber(2) - 1);
        }
      } else if (fixedValue <= this.options.value1) {
        fixedValue = this.getValueByIndex(this.getIndexByValueNumber(1) + 1);
      }
    }

    console.warn(`Note: value${number} (${value}) is changed to ${fixedValue} to fit to step size.`);
    return fixedValue;
  }

  private findClosestAllowedValue(initialValue: number): number {
    const min = this.options.minValue;
    const step = this.options.stepSize;
    const index = Math.round((initialValue - min) / step);
    return index * step + min;
  }

  private identifyMaxFractionalPrecision(): number {
    const fractionSizes = [
      this.options.stepSize,
      this.options.minValue,
      this.options.maxValue,
    ].map((value) => {
      const precision = Number(String(value).split('.')[1]?.length);
      return Number.isNaN(precision) ? 0 : precision;
    });
    return Math.max(...fractionSizes);
  }
}

export default Model;
