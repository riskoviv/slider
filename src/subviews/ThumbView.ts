import SubView from '../SubView';

class ThumbView extends SubView {
  private readonly elem = this.$elem.get()[0];

  constructor(protected readonly elementNumber: 1 | 2) {
    super();
    this.bindEventListeners();
    this.$elem.css(
      '--thumb-thickness',
      `${this.params.stepSizeInPercents}%`,
    );
  }

  private bindEventListeners() {
    this.elem.addEventListener('pointerdown', this.thumbPointerDown);
    this.$elem.on('contextmenu', this.thumbPreventContextMenu);
  }

  private thumbPointerDown = (e: PointerEvent) => {
    if (e.button !== 0) {
      return;
    }

    e.preventDefault();

    this.elem.setPointerCapture(e.pointerId);

    if (this.thumbDirectContainer === undefined) {
      [this.thumbDirectContainer] = this.$elem.parent().get();
    }

    this.elem.addEventListener('pointermove', this.thumbPointerMove);
    this.elem.addEventListener('pointerup', this.thumbPointerUp);
  }

  private thumbPointerMove = (e: PointerEvent) => {
    const newPosition = this.pixelsToPercentsOfBaseLength(
      this.isVertical
        ? e.pageY - this.thumbDirectContainer.offsetTop
        : e.pageX - this.thumbDirectContainer.offsetLeft,
    );

    const movedHalfStep = this.isCursorMovedHalfStep(newPosition);
    const onStepPosition = this.isCursorOnStepPosition(newPosition);

    if (movedHalfStep || onStepPosition) {
      const thumbInRange = this.isHandleInRange(newPosition);
      if (thumbInRange) {
        const isHandleAwayFromOtherHandle = this.params.isInterval
          ? this.isHandleKeepsDistance(newPosition)
          : true;

        if (thumbInRange && isHandleAwayFromOtherHandle) {
          this.setPositionAndCurrentValue(
            newPosition,
            movedHalfStep,
          );
        }
      }
    }
  }

  private thumbPointerUp = (e: PointerEvent) => {
    if (e.button !== 0) {
      e.preventDefault();
    }

    this.elem.removeEventListener('pointermove', this.thumbPointerMove);
    this.elem.removeEventListener('pointerup', this.thumbPointerUp);
  }

  private thumbPreventContextMenu = () => false;
}

export default ThumbView;
