import EventEmitter from './EventEmitter';

abstract class View extends EventEmitter implements IView {
  readonly $elem: JQuery<HTMLElement> = $('<div></div>');

  private readonly viewType: string = 'view';

  constructor(private params: ViewParams) {
    super();
  }

  render(parentElement: JQuery<HTMLElement>): void {
    parentElement.append(this.$elem);
  }

  setPosition?(position: number): void {
    this.$elem.css(`--${this.viewType}-position`, `${position}%`);
  }

  setValue?(value: string): void {
    this.$elem.text(value);
  }

  removeView(): void {
    this.$elem.remove();
  }
}

export default View;
