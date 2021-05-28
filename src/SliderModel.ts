import EventEmitter from './EventEmitter';

class SliderModel extends EventEmitter implements ISliderModel {
  constructor(private options: ISliderPluginOptions) {
    super();
    setTimeout(() => this.setStepSize(12), 1000);
  }

  getOptions(): ISliderPluginOptions {
    return this.options;
  }

  setStepSize(stepSize: number): void {
    this.options.stepSize = stepSize;
    console.log(`stepSize was changed to ${stepSize}`);
    this.emit('stepSizeChanged', this.options.stepSize);
  }

  publicMethods: Object = {
    getOptions: this.getOptions.bind(this),
    setStepSize: this.setStepSize.bind(this),
  }
}

export default SliderModel;
