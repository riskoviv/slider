import EventEmitter from './EventEmitter';

class SliderModel extends EventEmitter implements ISliderModel {
  allowedRealValues: number[];

  constructor(private options: ISliderPluginOptions) {
    super();
    this.createAllowedRealValuesArr();
    this.options.value1 = this.fixValue(this.options.value1);
    this.options.value2 = this.fixValue(this.options.value2);
  }

  getOptions(): ISliderPluginOptions {
    return this.options;
  }

  getStateOptions(): ISliderPluginStateOptions {
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
    this.emit('stepSizeChanged', this.options.stepSize);
  }

  setHandlePos(handleNumber: 1 | 2, position: number) {
    this.options[`handle${handleNumber}Pos`] = position;
  }

  setValue(handleNumber: 1 | 2, valueIndex: number): void {
    this.options[`value${handleNumber}`] = this.allowedRealValues[valueIndex];

    if (this.options.showTip) {
      this.emit('valueChanged', { number: handleNumber, value: this.options[`value${handleNumber}`] });
    }
  }

  publicMethods: Object = {
    getOptions: this.getOptions.bind(this),
    setStepSize: this.setStepSize.bind(this),
  }

  private fixValue(value: number) {
    const { minValue, maxValue } = this.options;
    if (value < minValue) return minValue;
    if (value > maxValue) return maxValue;

    if (!this.allowedRealValues.includes(value)) {
      return this.findClosestAllowedRealValue(value);
    }

    return value;
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
    this.allowedRealValues = [];
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

export default SliderModel;
