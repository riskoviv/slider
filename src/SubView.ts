import EventEmitter from './EventEmitter';

abstract class SubView extends EventEmitter implements ISubView {
  readonly $elem: JQuery<HTMLElement>;

  protected abstract readonly viewType: ViewType;

  protected readonly elementNumber?: 1 | 2;

  constructor() {
    super();
    this.$elem = this.render();
  }

  protected render(): JQuery<HTMLElement> {
    return $(`<div class="slider__${this.viewType}${this.elementNumber !== undefined ? ` slider__${this.viewType}_${this.elementNumber}` : ''}"></div>`);
  }

  removeView(): void {
    this.$elem.remove();
  }
}

export default SubView;
