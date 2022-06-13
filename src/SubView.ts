import $ from 'jquery';
import EventEmitter from './EventEmitter';

abstract class SubView extends EventEmitter implements ISubView {
  $elem: JQuery<HTMLDivElement>;

  constructor(
    private readonly viewType: ViewType,
    private readonly elementNumber?: 1 | 2,
  ) {
    super();
    this.$elem = this.render();
  }

  protected render(): JQuery<HTMLDivElement> {
    let numberModifier = '';
    let numberDataAttr = '';
    if (this.elementNumber !== undefined) {
      numberModifier = ` slider__${this.viewType}_${this.elementNumber}`;
      numberDataAttr = ` data-number="${this.elementNumber}"`;
    }

    const $elem: JQuery<HTMLDivElement> = $(`
      <div
        class="slider__${this.viewType}${numberModifier}"
        ${numberDataAttr}
      ></div>
    `);
    return $elem;
  }

  removeView(): void {
    this.$elem.remove();
  }
}

export default SubView;
