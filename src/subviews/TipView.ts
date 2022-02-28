import SubView from '../SubView';

class TipView extends SubView {
  constructor(public readonly elementNumber: 1 | 2) {
    super();
  }

  setValue(value: number): void {
    this.$elem.text(value);
  }
}

export default TipView;
