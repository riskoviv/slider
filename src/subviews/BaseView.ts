import SubView from '../SubView';

class BaseView extends SubView implements IBaseView {
  readonly elem = this.$elem.get()[0];

  constructor() {
    super();
    this.bindEventListeners();
  }

  private bindEventListeners() {
    this.elem.addEventListener('pointerdown', this.pointerDown);
    this.$elem.on('contextmenu', this.preventContextMenu);
  }

  private pointerDown(e: PointerEvent): void {
    if (e.button !== 0) {
      return;
    }

    e.preventDefault();
    this.elem.setPointerCapture(e.pointerId);

    this.emit('basePointerDown', { target: e.target, number: this.elementNumber });
  }

  private preventContextMenu = () => false;
}

export default BaseView;
