import View from '../View';

class TipView extends View implements ITipView {
  readonly $elem: JQuery<HTMLDivElement>;

  constructor(elementNumber: 1 | 2) {
    super({ elementNumber });
    this.$elem = $(`<div class="slider__tip slider__tip_${elementNumber}"></div>`);
  }

  setValue(value: number) {
    this.$elem.text(value);
  }

  setPosition(position: number) {
    this.$elem.css('--tip-position', `${position}%`);
  }
}

export default TipView;
