import EventEmitter from '../EventEmitter';

class SliderTipView extends EventEmitter implements ISliderTipView {
  $elem = $('<div class="slider__tip"></div>');

  setValue(value: number) {
    this.$elem.text(value);
  }

  setPosition(left: number) {
    this.$elem.css('left', `${left}%`);
  }
}

export default SliderTipView;
