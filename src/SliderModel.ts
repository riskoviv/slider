import EventEmitter from './EventEmitter';

class SliderModel extends EventEmitter implements ISliderModel {
  constructor(private options: ISliderPluginOptions) {
    super();
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
    const realValue = Math.round(realRange * percentValue + min);
    return realValue;
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
