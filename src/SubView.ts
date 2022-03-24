import EventEmitter from './EventEmitter';

abstract class SubView extends EventEmitter implements ISubView {
  $elem: JQuery<HTMLDivElement> = $('<div></div>');

  protected readonly viewType = this.constructor.name.slice(0, -4).toLowerCase();

  constructor(protected readonly elementNumber?: 1 | 2) {
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

    const elem: JQuery<HTMLDivElement> = $(`
      <div
        class="slider__${this.viewType}${numberModifier}"
        ${numberDataAttr}
      ></div>
    `);
    return elem;
  }

  removeView(): void {
    this.$elem.remove();
  }
}

export default SubView;
