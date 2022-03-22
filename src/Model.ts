import EventEmitter from './EventEmitter';

class Model extends EventEmitter implements IModel {
  allowedValues: number[] = [];

  allowedPositions: number[] = [];

  viewValues: ViewValues = {
    positions: { 1: 0, 2: 100 },
    stepInPercents: 10,
    halfStepInPercents: 5,
  };

  constructor(public options: IPluginOptions) {
    super();
    this.createAllowedValuesArr();
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

  getValueIndex(valueNumber: 1 | 2): number {
    return this.allowedValues.indexOf(this.options[`value${valueNumber}`]);
  }

  setStepSize(stepSize: number): void {
    this.options.stepSize = stepSize;
    this.createAllowedValuesArr();
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

  private fixValues() {
    if (!this.allowedValues.includes(this.options.value1)) {
      this.options.value1 = this.fixValue(1, this.options.value1);
    }

    if (this.options.isInterval) {
      if (!this.allowedValues.includes(this.options.value2)) {
        this.options.value2 = this.fixValue(2, this.options.value2);
      }

      if (this.options.value1 === this.options.value2) {
        const warnMsgStart = `Warning: difference between value1 and value2 is less than stepSize (${this.options.stepSize}) in plugin options and leads to equality of value1 and value2.`;
        const warnMsgEnd = '\nPlease check values that you passed to plugin options.';

        if (this.options.value1 === this.options.maxValue) {
          [this.options.value1] = this.allowedValues.slice(-2);
          console.warn(`${warnMsgStart} Also value1 was too close to maxValue, so value1 is now set to previous closest allowed value.${warnMsgEnd}`);
        } else if (this.options.value2 === this.options.minValue) {
          [, this.options.value2] = this.allowedValues;
          console.warn(`${warnMsgStart} Also value2 was too close to minValue, so value2 is now set to next closest allowed value.${warnMsgEnd}`);
        } else {
          const value1Index = this.allowedValues.indexOf(this.options.value1);
          this.options.value2 = this.allowedValues[value1Index + 1];
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

  private fixValue(num: 1 | 2, value: number): number {
    let fixedValue = value;
    if (value > this.options.maxValue) fixedValue = this.options.maxValue;
    else if (value < this.options.minValue) fixedValue = this.options.minValue;
    else if (!this.allowedValues.includes(value)) {
      fixedValue = this.findClosestAllowedValue(value);
    }

    if (this.options.isInterval) {
      if (num === 1) {
        if (fixedValue >= this.options.value2) {
          fixedValue = this.allowedValues[
            this.allowedValues.indexOf(this.options.value2) - 1
          ];
        }
      } else if (fixedValue <= this.options.value1) {
        fixedValue = this.allowedValues[
          this.allowedValues.indexOf(this.options.value1) + 1
        ];
      }
    }

    console.warn(`Note: value${num} (${value}) is changed to ${fixedValue} to fit to step size.`);
    return fixedValue;
  }

  private findClosestAllowedValue(value: number): number {
    const valToRight = this.allowedValues.find((val) => val > value);
    if (valToRight !== undefined) {
      const valToRightIndex = this.allowedValues.indexOf(valToRight);
      return (valToRight - value < this.options.stepSize / 2)
        ? valToRight
        : this.allowedValues[valToRightIndex - 1];
    }

    return value; // impossible to happen really
  }

  private identifyStepSizeFractionalPrecision(): number {
    const stepAsString = String(this.options.stepSize);
    if (!stepAsString.includes('.')) return 0;
    return stepAsString.split('.')[1].length;
  }

  private createAllowedValuesArr(): void {
    const stepPrecision = this.identifyStepSizeFractionalPrecision();

    this.allowedValues.length = 0;

    for (
      let stepValue = this.options.minValue;
      stepValue <= this.options.maxValue;
      stepValue += this.options.stepSize
    ) {
      this.allowedValues.push(stepValue);
    }

    if (stepPrecision > 0) {
      this.allowedValues = this.allowedValues.map((stepValue) => (
        Number(stepValue.toFixed(stepPrecision))
      ));
    }

    const allowedValuesLastValue = this.allowedValues.slice(-1)[0];

    if (allowedValuesLastValue < this.options.maxValue) {
      this.allowedValues.push(this.options.maxValue);
    }
  }
}

export default Model;
