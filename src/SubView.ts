import $ from 'jquery';

import EventEmitter from './EventEmitter';

abstract class SubView extends EventEmitter implements ISubView {
  readonly $elem: JQuery<HTMLDivElement>;

  constructor(
    private readonly viewType: ViewType,
    private readonly elementNumber: 1 | 2 | 3 = 1,
  ) {
    super();
    this.$elem = this.render();
  }

  removeView(): void {
    this.$elem.remove();
  }

  protected render(): JQuery<HTMLDivElement> {
    const isNumberedView = this.viewType === 'thumb' || this.viewType === 'tip';
    let $elem: JQuery<HTMLDivElement>;
    if (isNumberedView) {
      $elem = $(`
        <div
          class="slider__${this.viewType} slider__${this.viewType}_${this.elementNumber}"
          data-number="${this.elementNumber}"
        ></div>
      `);
    } else {
      $elem = $(`<div class="slider__${this.viewType}"></div>`);
    }

    return $elem;
  }
}

export default SubView;
