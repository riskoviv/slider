import EventEmitter from './EventEmitter';

class SliderModel extends EventEmitter implements ISliderModel {
  allowedRealValues: number[];

  constructor(private options: ISliderPluginOptions) {
    super();
    this.createAllowedRealValuesArr();
  }

  getOptions(): ISliderPluginOptions {
    return this.options;
  }

  setStepSize(stepSize: number): void {
    this.options.stepSize = stepSize;
    this.emit('stepSizeChanged', this.options.stepSize);
  }

  translatePercentageToRealValue(percentValue: number): number {
    const min = this.options.minValue;
    const max = this.options.maxValue;
    const realRange = max - min;
    const realValue = Math.round(realRange * (percentValue / 100) + min);
    return realValue;
  }

  identifyStepSizeFractionalPrecision(): number {
    const stepAsString = this.options.stepSize.toString();
    if (stepAsString.indexOf('.') === -1) return 0;
    return (stepAsString.length - 1) - stepAsString.indexOf('.');
  }

  createAllowedRealValuesArr(): void {
    this.allowedRealValues = [];
    const stepPrecision = this.identifyStepSizeFractionalPrecision();
    for (
      let stepValue = this.options.minValue;
      stepValue <= this.options.maxValue;
      stepValue += this.options.stepSize
    ) {
      this.allowedRealValues.push(Number(stepValue.toFixed(stepPrecision)));
    }
    const allowedRealValuesLastValue = this.allowedRealValues[this.allowedRealValues.length - 1];
    if (allowedRealValuesLastValue < this.options.maxValue) {
      this.allowedRealValues.push(this.options.maxValue);
    }
    console.log(this.allowedRealValues);
  }

  setValue1(handle1percent: number): void {
    this.options.value1 = this.translatePercentageToRealValue(handle1percent);
    this.emit('value1Changed', this.options.value1);
  }

  publicMethods: Object = {
    getOptions: this.getOptions.bind(this),
    setStepSize: this.setStepSize.bind(this),
  }
}

export default SliderModel;
