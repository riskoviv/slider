import EventEmitter from './EventEmitter';

class SliderModel extends EventEmitter {
  constructor(private options: ISliderPluginOptions) {
    super();
  }

  getWidth() {
    return this.options.styles?.width;
  }
}

export default SliderModel;
