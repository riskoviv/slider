import EventEmitter from '../EventEmitter';

class SliderTipView extends EventEmitter implements ISliderTipView {
  $elem = $('<div class="slider__tip"></div>');

  setValue(value: number) {
    this.$elem.text(value);
  }

  setPosition(position: number) {
    this.$elem.css('--tip-position', `${position}%`);
  }
}

export default SliderTipView;
