import EventEmitter from '../EventEmitter';

class SliderBaseView extends EventEmitter implements ISliderSubView {
  $elem = $('<div class="slider__base"></div>');
}

export default SliderBaseView;
