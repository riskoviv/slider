import EventEmitter from './EventEmitter';

abstract class View extends EventEmitter implements IView {
  readonly $elem: JQuery<HTMLElement> = $('<div></div>');

  static allowedPositions: number[];

  constructor(private params: ViewParams) {
    super();
  }

  render() {

  }

  private createAllowedPositionsArr(): void {

  };
}

export default View;
