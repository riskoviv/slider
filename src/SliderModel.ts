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

  changeValue1(value1: number): void {
    this.options.value1 = value1;
    this.emit('value1Changed', value1);
  }

  publicMethods: Object = {
    getOptions: this.getOptions.bind(this),
    setStepSize: this.setStepSize.bind(this),
  }
}

export default SliderModel;
