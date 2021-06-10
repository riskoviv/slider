import EventEmitter from '../EventEmitter';

class SliderTipView extends EventEmitter implements ISliderTipView {
  $elem = $('<div class="slider__tip-container"></div>');

  $body = $('<div class="slider__tip-body"></div>');

  constructor() {
    super();
    this.$elem.append(this.$body);
  }

  setValue(value: number) {
    this.$body.text(value);
  }

  setPosition(left: number) {
    this.$body.css('left', `${left}px`);
  }
}

export default SliderTipView;
