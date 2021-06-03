import EventEmitter from '../EventEmitter';

class SliderTipView extends EventEmitter implements ISliderSubView {
  $elem = $('<div class="slider__tip js-slider__tip"></div>');
}

export default SliderTipView;
