import SubView from '../SubView';

class TipView extends SubView implements ITipView {
  constructor(public readonly elementNumber: 1 | 2) {
    super();
  }

  setValue(value: number): void {
    this.$elem.text(value);
  }
}

export default TipView;
