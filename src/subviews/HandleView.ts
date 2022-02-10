import View from '../View';

class HandleView extends View {
  protected readonly viewType = 'handle';

  private readonly elem = this.$elem.get()[0];

  constructor(protected readonly elementNumber: 1 | 2) {
    super();
    this.bindEventListeners();
    this.$elem.css(
      '--handle-thickness',
      `${this.params.stepSizeInPercents}%`,
    );
  }


  private bindEventListeners() {
    this.elem.addEventListener('pointerdown', this.handlePointerDown);
    this.$elem.on('contextmenu', this.handlePreventContextMenu);
  }

  private handlePointerDown = (e: PointerEvent) => {
    if (e.button !== 0) {
      return;
    }

    e.preventDefault();

    this.elem.setPointerCapture(e.pointerId);

    if (this.handleDirectContainer === undefined) {
      [this.handleDirectContainer] = this.$elem.parent().get();
    }

    this.elem.addEventListener('pointermove', this.handlePointerMove);
    this.elem.addEventListener('pointerup', this.handlePointerUp);
  }


  private handlePointerMove = (e: PointerEvent) => {
    const newPosition = this.pixelsToPercentsOfBaseLength(
      this.isVertical
        ? e.pageY - this.handleDirectContainer.offsetTop
        : e.pageX - this.handleDirectContainer.offsetLeft,
    );

    const movedHalfStep = this.isCursorMovedHalfStep(newPosition);
    const onStepPosition = this.isCursorOnStepPosition(newPosition);

    if (movedHalfStep || onStepPosition) {
      const handleInRange = this.isHandleInRange(newPosition);
      if (handleInRange) {
        const isHandleAwayFromOtherHandle = this.params.isInterval
          ? this.isHandleKeepsDistance(newPosition)
          : true;

        if (handleInRange && isHandleAwayFromOtherHandle) {
          this.setPositionAndCurrentValue(
            newPosition,
            movedHalfStep,
          );
        }
      }
    }
  }

  private handlePointerUp = (e: PointerEvent) => {
    if (e.button !== 0) {
      e.preventDefault();
    }

    this.elem.removeEventListener('pointermove', this.handlePointerMove);
    this.elem.removeEventListener('pointerup', this.handlePointerUp);
  }

  private handlePreventContextMenu = () => false;
}

export default HandleView;
