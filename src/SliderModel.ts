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

  setStepSize(stepSize: number): void {
    this.options.stepSize = stepSize;
    this.emit('stepSizeChanged', this.options.stepSize);
  }

  setHandle1Pos(left: number) {
    this.options.handle1Pos = left;
  }

  setHandle2Pos(left: number) {
    this.options.handle2Pos = left;
  }

  setValue1(valueIndex: number): void {
    this.options.value1 = this.allowedRealValues[valueIndex];
    this.emit('value1Changed', this.options.value1);
  }

  setValue2(valueIndex: number): void {
    this.options.value2 = this.allowedRealValues[valueIndex];
    this.emit('value2Changed', this.options.value2);
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

  private findClosestAllowedRealValue(left: number) {
    return this.allowedRealValues.reduce((lastMinValue, currentValue) => {
      if (Math.abs(left - currentValue) < Math.abs(left - lastMinValue)) {
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
