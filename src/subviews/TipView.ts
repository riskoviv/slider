import SubView from '../SubView';

class TipView extends SubView implements ITipView {
  private tipHiddenClass = 'slider__tip_hidden';

  constructor(elementNumber: 1 | 2 | 3 = 1) {
    super('tip', elementNumber);
    if (elementNumber === 3) this.$elem.addClass(this.tipHiddenClass);
  }

  setValue(value: number | string): void {
    if (typeof value === 'number') {
      if (Number.isFinite(value)) this.$elem.text(value);
    } else {
      this.$elem.text(value);
    }
  }
}

export default TipView;
