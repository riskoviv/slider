import EventEmitter from './EventEmitter';

class SliderModel extends EventEmitter {
  constructor(private options: ISliderPluginOptions) {
    super();
  }
}

export default SliderModel;
