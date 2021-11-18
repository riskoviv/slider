import EventEmitter from '../EventEmitter';

class SliderTipView extends EventEmitter implements ISliderTipView {
  $elem = $('<div class="slider__tip"></div>');

  private axis: 'left' | 'top';

  constructor(private isVertical: boolean) {
    super();
    this.axis = this.isVertical ? 'top' : 'left';
  }

  setValue(value: number) {
    this.$elem.text(value);
  }

  setPosition(position: number) {
    this.$elem.css(this.axis, `${position}%`);
  }
}

export default SliderTipView;
