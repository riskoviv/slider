import SubView from '../SubView';

class TipView extends SubView implements ITipView {
  constructor(elementNumber: 1 | 2 = 1) {
    super('tip', elementNumber);
  }

  setValue(value: number): void {
    this.$elem.text(value);
  }
}

export default TipView;
