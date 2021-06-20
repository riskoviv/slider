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

  setValue1(valueIndex: number): void {
    this.options.value1 = this.allowedRealValues[valueIndex];
    this.emit('value1Changed', this.options.value1);
  }

  publicMethods: Object = {
    getOptions: this.getOptions.bind(this),
    setStepSize: this.setStepSize.bind(this),
  }
}

export default SliderModel;
