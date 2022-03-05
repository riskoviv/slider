import EventEmitter from './EventEmitter';

abstract class SubView extends EventEmitter implements ISubView {
  $elem: JQuery<HTMLElement> = $('<div></div>');

  protected readonly viewType = this.constructor.name.slice(0, -4).toLowerCase();

  protected readonly elementNumber?: 1 | 2;

  render(): JQuery<HTMLElement> {
    let numberModifier = '';
    let numberDataAttr = '';
    if (this.elementNumber !== undefined) {
      numberModifier = ` slider__${this.viewType}_${this.elementNumber}`;
      numberDataAttr = ` data-number="${this.elementNumber}"`;
    }

    this.$elem = $(`
      <div
        class="slider__${this.viewType}${numberModifier}"
        ${numberDataAttr}
      ></div>
    `);
    return this.$elem;
  }

  removeView(): void {
    this.$elem.remove();
  }
}

export default SubView;
