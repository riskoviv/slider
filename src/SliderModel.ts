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

  publicMethods: Object = {
    getOptions: this.getOptions.bind(this),
    setStepSize: this.setStepSize.bind(this),
  }
}

export default SliderModel;
