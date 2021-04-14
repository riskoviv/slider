import EventEmitter from '../eventEmitter';
import SliderModel from '../model/sliderModel';
import SliderView from '../views/sliderView';

class SliderPresenter extends EventEmitter {
  private model: SliderModel;

  private view: SliderView;

  constructor(model: SliderModel, view: SliderView) {
    super();
    this.model = model;
    this.view = view;
  }
}

export default SliderPresenter;
