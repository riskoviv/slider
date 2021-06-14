import EventEmitter from '../EventEmitter';

class SliderBaseView extends EventEmitter implements ISliderBaseView {
  $elem = $('<div class="slider__base"></div>');
}

export default SliderBaseView;
