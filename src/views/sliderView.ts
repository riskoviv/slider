import EventEmitter from '../EventEmitter';

type SliderViewElements = {
  [key: string]: JQuery<HTMLElement>;
};

class SliderView extends EventEmitter {
  constructor(public elements: SliderViewElements) {
    super();
  }

  setWidth(elem: JQuery<HTMLElement>, width: number) {
    elem.css('width', width);
    return this;
  }
}

export default SliderView;
