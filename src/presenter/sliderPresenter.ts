import EventEmitter from '../EventEmitter';
import SliderModel from '../model/SliderModel';
import SliderView from '../views/SliderView';

class SliderPresenter extends EventEmitter {
  constructor(
    private model: SliderModel,
    private view: SliderView,
    private thisElem: JQuery<HTMLElement>,
  ) {
    super();
    // view.setWidth(view.elements.thisElement, model.getWidth());
  }
}

export default SliderPresenter;
