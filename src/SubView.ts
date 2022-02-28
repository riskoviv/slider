import EventEmitter from './EventEmitter';

abstract class SubView extends EventEmitter implements ISubView {
  $elem: JQuery<HTMLElement> = $('<div></div>');

  protected abstract readonly viewType: ViewType;

  protected readonly elementNumber?: 1 | 2;

  render(): JQuery<HTMLElement> {
    const elementNumberModifier = this.elementNumber !== undefined
      ? ` slider__${this.viewType}_${this.elementNumber}`
      : '';
    this.$elem = $(`<div class="slider__${this.viewType}${elementNumberModifier}"></div>`);
    return this.$elem;
  }

  removeView(): void {
    this.$elem.remove();
  }
}

export default SubView;