import SubView from '../SubView';

class TipView extends SubView implements ITipView {
  constructor(protected readonly elementNumber: 1 | 2 = 1) {
    super(elementNumber);
  }

  setValue(value: number): void {
    this.$elem.text(value);
  }
}

export default TipView;
