import View from '../View';

class TipView extends View implements ITipView {
  $elem = $('<div class="slider__tip"></div>');

  setValue(value: number) {
    this.$elem.text(value);
  }

  setPosition(position: number) {
    this.$elem.css('--tip-position', `${position}%`);
  }
}

export default TipView;
