import EventEmitter from './EventEmitter';

abstract class View extends EventEmitter implements IView {
  readonly $elem: JQuery<HTMLDivElement>;

  protected readonly viewType: string = 'view';

  protected readonly elementNumber?: 1 | 2;

  constructor() {
    super();
    this.$elem = this.render();
  }

  protected render(): JQuery<HTMLDivElement> {
    return $(`<div class="slider__${this.viewType}${this.elementNumber !== undefined ? ` slider__${this.viewType}_${this.elementNumber}` : ''}"></div>`);
  }

  removeView(): void {
    this.$elem.remove();
  }
}

export default View;
