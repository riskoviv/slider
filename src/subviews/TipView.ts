import View from '../View';

class TipView extends View {
  protected readonly viewType = 'tip';

  constructor(protected readonly elementNumber?: 1 | 2) {
    super();
  }

  setValue(value: number): void {
    this.$elem.text(value);
  }
}

export default TipView;
