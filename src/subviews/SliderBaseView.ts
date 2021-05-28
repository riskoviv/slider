import EventEmitter from '../EventEmitter';

class SliderBaseView extends EventEmitter implements ISliderSubView {
  HTML = $('<div class="slider__base"></div>');
}

export default SliderBaseView;
