import EventEmitter from './EventEmitter';
import SliderModel from './SliderModel';
import SliderView from './SliderView';

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
