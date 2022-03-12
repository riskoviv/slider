import EventEmitter from './EventEmitter';

class Model extends EventEmitter implements IModel {
  allowedRealValues: number[] = [];

  allowedPositions: number[] = [];

  viewValues: ViewValues = {
    positions: { 1: 0, 2: 100 },
    stepInPercents: 10,
    halfStepInPercents: 5,
  };

  constructor(public options: IPluginOptions) {
    super();
    this.createAllowedRealValuesArr();
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
    return this.allowedRealValues.indexOf(this.options[`value${valueNumber}`]);
  }

  setStepSize(stepSize: number): void {
    this.options.stepSize = stepSize;
    this.emit('stepSizeChanged');
  }

  setValue(thumbNumber: 1 | 2, valueIndex: number): void {
    this.options[`value${thumbNumber}`] = this.allowedRealValues[valueIndex];
    if (this.options.showTip) {
      this.emit('valueChanged', {
        tipNumber: thumbNumber,
        value: this.options[`value${thumbNumber}`],
      });
    }
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
    setVerticalState: this.setVerticalState.bind(this),
    setValue: this.setValue.bind(this),
  }

  private fixValues() {
    if (!this.allowedRealValues.includes(this.options.value1)) {
      this.options.value1 = this.fixValue(this.options.value1, 1);
    }

    if (this.options.isInterval) {
      if (!this.allowedRealValues.includes(this.options.value2)) {
        this.options.value2 = this.fixValue(this.options.value2, 2);
      }

      if (this.options.value1 === this.options.value2) {
        const warnMsgStart = `Warning: difference between value1 and value2 is less than stepSize (${this.options.stepSize}) in plugin options and leads to equality of value1 and value2.`;
        const warnMsgEnd = '\nPlease check values that you passed to plugin options.';

        if (this.options.value1 === this.options.maxValue) {
          this.options.value1 -= this.options.stepSize;
          console.warn(`${warnMsgStart} Also value1 was too close to maxValue, so value1 is now set to previous closest allowed value.${warnMsgEnd}`);
        } else if (this.options.value2 === this.options.minValue) {
          this.options.value2 += this.options.stepSize;
          console.warn(`${warnMsgStart} Also value2 was too close to minValue, so value2 is now set to next closest allowed value.${warnMsgEnd}`);
        } else {
          this.options.value2 += this.options.stepSize;
          console.warn(`${warnMsgStart} value2 is now set to next closest allowed value.${warnMsgEnd}`);
        }
      }
    }
  }

  private fixValue(num: 1 | 2, value: number): number {
    let fixedValue = value;
    if (value > this.options.maxValue) fixedValue = this.options.maxValue;
    else if (value < this.options.minValue) fixedValue = this.options.minValue;
    else if (!this.allowedRealValues.includes(value)) {
      fixedValue = this.findClosestAllowedRealValue(value);
    }

    if (this.options.isInterval) {
      if (num === 1) {
        if (fixedValue >= this.options.value2) {
          fixedValue = this.allowedRealValues[
            this.allowedRealValues.indexOf(this.options.value2) - 1
          ];
        }
      } else if (fixedValue <= this.options.value1) {
        fixedValue = this.allowedRealValues[
          this.allowedRealValues.indexOf(this.options.value1) + 1
        ];
      }
    }

    console.warn(`Note: value${num} (${value}) is changed to ${fixedValue} to fit to step size.`);
    return fixedValue;
  }

  private findClosestAllowedRealValue(value: number): number {
    const valToRight = this.allowedRealValues.find((val) => val > value);
    if (valToRight !== undefined) {
      const valToRightIndex = this.allowedRealValues.indexOf(valToRight);
      return (valToRight - value < this.options.stepSize / 2)
        ? valToRight
        : this.allowedRealValues[valToRightIndex - 1];
    }

    return value; // impossible to happen really
  }

  private identifyStepSizeFractionalPrecision(): number {
    const stepAsString = String(this.options.stepSize);
    if (!stepAsString.includes('.')) return 0;
    return stepAsString.split('.')[1].length;
  }

  private createAllowedRealValuesArr(): void {
    const stepPrecision = this.identifyStepSizeFractionalPrecision();

    this.allowedRealValues.length = 0;

    for (
      let stepValue = this.options.minValue;
      stepValue <= this.options.maxValue;
      stepValue += this.options.stepSize
    ) {
      this.allowedRealValues.push(stepValue);
    }

    if (stepPrecision > 0) {
      this.allowedRealValues = this.allowedRealValues.map((stepValue) => (
        Number(stepValue.toFixed(stepPrecision))
      ));
    }

    const allowedRealValuesLastValue = this.allowedRealValues.slice(-1)[0];

    if (allowedRealValuesLastValue < this.options.maxValue) {
      this.allowedRealValues.push(this.options.maxValue);
    }
  }
}

export default Model;
