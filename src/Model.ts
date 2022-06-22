import EventEmitter from './EventEmitter';

class Model extends EventEmitter implements IModel {
  options: IPluginOptions;

  allowedValuesCount: number;

  fractionalPrecision: number;

  penultimateValue: number;

  viewValues: ViewValues = {
    positions: { 1: NaN, 2: NaN },
    stepInPercents: NaN,
    penultimatePosition: NaN,
  };

  constructor(options: IPluginOptions) {
    super();
    this.options = { ...options };
    this.allowedValuesCount = this.getAllowedValuesCount();
    this.fractionalPrecision = this.identifyMaxFractionalPrecision();
    this.penultimateValue = this.getPenultimateValue();
    this.fixValues();
  }

  // debug method
  getOptions(): IPluginOptions {
    return { ...this.options };
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
    const value = this.options[`value${valueNumber}`];
    if (value === this.options.maxValue) return this.allowedValuesCount - 1;
    const index = Math.trunc((value - this.options.minValue) / this.options.stepSize);

    return index;
  }

  getIndexByValue(value: number): number {
    if (value === this.options.maxValue) return this.allowedValuesCount - 1;
    return (value - this.options.minValue) / this.options.stepSize;
  }

  getValueByIndex(index: number): number {
    const value = this.keepValueInRange(this.options.minValue + this.options.stepSize * index);
    const fixedValue = this.fixValueToPrecision(value);
    return fixedValue;
  }

  getPenultimateValue(): number {
    return this.fixValueToPrecision(
      this.options.minValue + this.options.stepSize * (this.allowedValuesCount - 2),
    );
  }

  getAllowedValuesCount(): number {
    return Math.ceil(
      (this.options.maxValue - this.options.minValue) / this.options.stepSize,
    ) + 1;
  }

  setValue1(value: number): void {
    this.setValue(1, value);
  }

  setValue2(value: number): void {
    this.setValue(2, value);
  }

  setVerticalState(isVertical: boolean): void {
    if (this.options.isVertical === isVertical) return;

    this.options.isVertical = isVertical;
    this.emit('isVerticalChanged', isVertical);
  }

  setInterval(isInterval: boolean): void {
    if (this.options.isInterval === isInterval) return;

    this.options.isInterval = isInterval;
    const { value1Fixed, value2Fixed } = this.fixValues();
    this.emit('isIntervalChanged', isInterval);

    if (value1Fixed) {
      this.emit('valueChanged', {
        number: 1,
        value: this.options.value1,
        changeTipValue: true,
      });
    }

    if (isInterval) {
      if (value2Fixed || Number.isNaN(this.viewValues.positions[2])) {
        this.emit('valueChanged', {
          number: 2,
          value: this.options.value2,
          changeTipValue: false,
        });
      }
    }
  }

  setShowProgress(showProgressBar: boolean): void {
    if (this.options.showProgressBar === showProgressBar) return;

    this.options.showProgressBar = showProgressBar;
    this.emit('showProgressChanged', showProgressBar);
  }

  setShowTip(showTip: boolean): void {
    if (this.options.showTip === showTip) return;

    this.options.showTip = showTip;
    this.emit('showTipChanged', showTip);
  }

  setShowScale(showScale: boolean): void {
    if (this.options.showScale === showScale) return;

    this.options.showScale = showScale;
    this.emit('showScaleChanged', showScale);
  }

  setStepSize(stepSize: number): void {
    if (!Number.isFinite(stepSize)) return;
    if (this.options.stepSize === stepSize) return;
    if (stepSize > this.options.maxValue - this.options.minValue) return;
    if (stepSize === 0) return;
    if (stepSize < 0) {
      this.options.stepSize = -stepSize;
    } else {
      this.options.stepSize = stepSize;
    }

    this.updateValues('stepSizeChanged');
  }

  setMinValue(minValue: number): void {
    if (!Number.isFinite(minValue)) return;
    if (this.options.minValue === minValue) return;
    if (minValue > this.options.maxValue) return;
    if (minValue === this.options.maxValue) {
      this.options.maxValue = minValue + this.options.stepSize;
    }

    this.options.minValue = minValue;

    this.updateValues('minValueChanged', true);
  }

  setMaxValue(maxValue: number): void {
    if (!Number.isFinite(maxValue)) return;
    if (maxValue === this.options.maxValue) return;
    if (maxValue < this.options.minValue) return;
    if (maxValue === this.options.minValue) {
      this.options.maxValue = maxValue + this.options.stepSize;
    } else {
      this.options.maxValue = maxValue;
    }

    this.updateValues('maxValueChanged', true);
  }

  fixValueToPrecision(value: number): number {
    return Number.parseFloat(value.toFixed(this.fractionalPrecision));
  }

  publicMethods: IPluginPublicMethods = {
    getOptions: this.getOptions.bind(this),
    setValue1: this.setValue1.bind(this),
    setValue2: this.setValue2.bind(this),
    setVerticalState: this.setVerticalState.bind(this),
    setInterval: this.setInterval.bind(this),
    setShowProgress: this.setShowProgress.bind(this),
    setShowTip: this.setShowTip.bind(this),
    setShowScale: this.setShowScale.bind(this),
    setStepSize: this.setStepSize.bind(this),
    setMinValue: this.setMinValue.bind(this),
    setMaxValue: this.setMaxValue.bind(this),
  }

  private setValue(number: 1 | 2, value: number): void {
    const valueNumber: 'value1' | 'value2' = `value${number}`;
    if (this.options[valueNumber] === value) return;

    this.options[valueNumber] = this.fixValue(number, value);
    this.emit('valueChanged', {
      number,
      value: this.options[valueNumber],
      changeTipValue: true,
    });
  }

  private updateValues(eventName: EventName, ignoreIsFixed = false) {
    this.fractionalPrecision = this.identifyMaxFractionalPrecision();

    this.emit(eventName);

    const { value1Fixed, value2Fixed } = this.fixValues();

    if (ignoreIsFixed || value1Fixed) {
      this.emit('valueChanged', {
        number: 1,
        value: this.options.value1,
        changeTipValue: true,
      });
    }

    if (this.options.isInterval) {
      if (ignoreIsFixed || value2Fixed) {
        this.emit('valueChanged', {
          number: 2,
          value: this.options.value2,
          changeTipValue: true,
        });
      }
    }
  }

  private isValueAllowed(value: number): boolean {
    if (!this.isValueInRange(value)) return false;
    if (value === this.options.minValue || value === this.options.maxValue) return true;
    const valueIndex = this.getIndexByValue(value);
    return Number.isInteger(valueIndex);
  }

  private getSecondValue(): number {
    return this.options.minValue + this.options.stepSize;
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

  private fixValue(number: 1 | 2, value: number): number {
    const warnMsgEnd = [];
    let fixedValue = value;
    if (!this.isValueInRange(fixedValue)) {
      fixedValue = this.keepValueInRange(fixedValue);
      warnMsgEnd.push(' to keep it in range');
    }

    if (!this.isValueAllowed(fixedValue)) {
      fixedValue = this.findClosestAllowedValue(fixedValue);
      warnMsgEnd.push(' to satisfy stepSize');
    }

    if (this.options.isInterval) {
      if (number === 1) {
        if (fixedValue >= this.options.value2) {
          if (this.options.value2 === this.options.maxValue) {
            fixedValue = this.getPenultimateValue();
          } else {
            fixedValue = this.getValueByIndex(this.getIndexByValueNumber(2) - 1);
          }
          warnMsgEnd.push(' to make it less than value2');
        }
      } else if (fixedValue <= this.options.value1) {
        fixedValue = this.getValueByIndex(this.getIndexByValueNumber(1) + 1);
        warnMsgEnd.push(' to make it more than value1');
      }
    }

    fixedValue = this.fixValueToPrecision(fixedValue);

    if (fixedValue !== value) {
      console.warn(`Note: value${number} (${value}) is changed to ${fixedValue}${warnMsgEnd.join(' and')}.`);
    }
    return fixedValue;
  }

  private isValueInRange(value: number): boolean {
    return value >= this.options.minValue && value <= this.options.maxValue;
  }

  private keepValueInRange(value: number): number {
    if (value > this.options.maxValue) return this.options.maxValue;
    if (value < this.options.minValue) return this.options.minValue;
    return value;
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
      if (!String(value).includes('.')) return 0;
      return String(value).split('.')[1].length;
    });
    return Math.max(...fractionSizes);
  }
}

export default Model;
