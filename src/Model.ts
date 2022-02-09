import EventEmitter from './EventEmitter';

class Model extends EventEmitter implements IModel {
  allowedRealValues: number[] = [];

  allowedPositions: number[] = [];

  viewValues: ViewValues = {
    positions: { 1: 0, 2: 100 },
    stepSizeInPercents: 10,
  };

  constructor(public options: IPluginOptions) {
    super();
    this.createAllowedRealValuesArr();
    this.fixValues();
  }

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

  setStepSize(stepSize: number): void {
    this.options.stepSize = stepSize;
    this.emit('stepSizeChanged', {
      stepSize: this.options.stepSize,
    });
  }

  getValueIndex(valueNumber: 1 | 2): number {
    return this.allowedRealValues.indexOf(this.options[`value${valueNumber}`]);
  }

  setValue(handleNumber: 1 | 2, valueIndex: number): void {
    this.options[`value${handleNumber}`] = this.allowedRealValues[valueIndex];

    if (this.options.showTip) {
      this.emit('valueChanged', {
        number: handleNumber,
        value: this.options[`value${handleNumber}`],
      });
    }
  }

  changeOrientation(isVertical: boolean): void {
    this.options.isVertical = isVertical;
    this.emit('isVerticalChanged', {
      isVertical: this.options.isVertical,
    });
  }

  publicMethods: IPluginPublicMethods = {
    debug: {
      getOptions: this.getOptions.bind(this),
    },
    setStepSize: this.setStepSize.bind(this),
    changeOrientation: this.changeOrientation.bind(this),
    setValue: this.setValue.bind(this),
  }

  private fixValues() {
    if (!this.allowedRealValues.includes(this.options.value1)) {
      this.options.value1 = this.fixValue(this.options.value1, 1);
    }

    if (this.options.isInterval) {
      this.options.value2 = this.fixValue(this.options.value2, 2);

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

  private fixValue(value: number, num: 1 | 2): number {
    if (this.allowedRealValues.includes(value)) {
      return value;
    }
    const fixedValue = this.findClosestAllowedRealValue(value);
    console.warn(`Note: value${num} (${value}) is changed to ${fixedValue} to fit to step size.`);
    return fixedValue;
  }

  private findClosestAllowedRealValue(position: number) {
    return this.allowedRealValues.reduce((lastMinValue, currentValue) => {
      if (Math.abs(position - currentValue) < Math.abs(position - lastMinValue)) {
        return currentValue;
      }
      return lastMinValue;
    });
  }

  private identifyStepSizeFractionalPrecision(): number {
    const stepAsString = this.options.stepSize.toString();
    if (!stepAsString.includes('.')) return 0;
    return (stepAsString.length - 1) - stepAsString.indexOf('.');
  }

  private createAllowedRealValuesArr(): void {
    const stepPrecision = this.identifyStepSizeFractionalPrecision();

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

    const allowedRealValuesLastValue = this.allowedRealValues[this.allowedRealValues.length - 1];

    if (allowedRealValuesLastValue < this.options.maxValue) {
      this.allowedRealValues.push(this.options.maxValue);
    }
  }
}

export default Model;
