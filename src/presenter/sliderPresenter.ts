import EventEmitter from '../EventEmitter';
import SliderModel from '../model/SliderModel';
import SliderView from '../views/SliderView';

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
