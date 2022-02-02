import EventEmitter from './EventEmitter';

abstract class View extends EventEmitter implements IView {
  readonly $elem: JQuery<HTMLElement> = $('<div></div>');

  static readonly $controlContainer: JQuery<HTMLDivElement> = $('<div class="slider__control-container"></div>');

  static allowedPositions: number[];

  constructor(private params: ViewParams) {
    super();
  }

  render() {

  }
}

export default View;
