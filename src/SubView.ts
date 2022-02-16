import EventEmitter from './EventEmitter';

abstract class SubView extends EventEmitter implements ISubView {
  $elem: JQuery<HTMLElement> = $('<div></div>');

  protected abstract readonly viewType: ViewType;

  protected readonly elementNumber?: 1 | 2;

  render(): JQuery<HTMLElement> {
    this.$elem = $(`<div class="slider__${this.viewType}${this.elementNumber !== undefined ? ` slider__${this.viewType}_${this.elementNumber}` : ''}"></div>`);
    return this.$elem;
  }

  removeView(): void {
    this.$elem.remove();
  }
}

export default SubView;
