import View from '../View';

class HandleView extends View implements IHandleView {
  readonly $elem: JQuery<HTMLDivElement>;

  elem = this.$elem.get()[0];

  private currentPosition = 0;

  private handleDirectContainer: HTMLElement = this.$elem.parent().get()[0];

  constructor(
    private params: HandleParams,
    private handleNumber: 1 | 2,
    private isVertical: boolean,
  ) {
    super();
    this.$elem = $(`<div class="slider__handle slider__handle_${handleNumber}"></div>`);
    this.bindEventListeners();
    this.$elem.css(
      '--handle-thickness',
      `${this.params.stepSizeInPercents}%`,
    );
  }

  setPositionAndCurrentValue(allowedPosition: number, findClosest: boolean) {
    this.currentPosition = findClosest
      ? this.findClosestAllowedPosition(allowedPosition)
      : allowedPosition;
    View.$controlContainer.css(`--handle-${this.handleNumber}-position`, `${this.currentPosition}%`);
    this.params.positions[this.handleNumber] = this.currentPosition;
    this.emit('handleValueChange', {
      handleNumber: this.handleNumber,
      index: this.params.allowedPositions.indexOf(this.currentPosition),
    });
  }

  private bindEventListeners() {
    this.elem.addEventListener('pointerdown', this.handlePointerDown);
    this.$elem.on('contextmenu', this.handlePreventContextMenu);
  }

  private findClosestAllowedPosition(position: number) {
    return this.params.allowedPositions.reduce((lastMinValue, currentValue) => {
      if (Math.abs(position - currentValue) < Math.abs(position - lastMinValue)) {
        return currentValue;
      }
      return lastMinValue;
    });
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

  private pixelsToPercentsOfBaseLength(pixels: number): number {
    const dimension = this.isVertical ? 'offsetHeight' : 'offsetWidth';
    return Number(((pixels / this.handleDirectContainer[dimension]) * 100)
      .toFixed(1));
  }

  private isCursorMovedHalfStep(position: number): boolean {
    return Math.abs(position - this.currentPosition) > this.params.halfStep;
  }

  private isCursorOnStepPosition(position: number) {
    return (this.params.allowedPositions.includes(position)
      && position !== this.currentPosition);
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

  private isHandleKeepsDistance(newPosition: number): boolean {
    if (this.handleNumber === 1) {
      return newPosition <= this.params.positions[2] - this.params.stepSizeInPercents;
    }

    return newPosition >= this.params.positions[1] + this.params.stepSizeInPercents;
  }

  private isHandleInRange = (position: number) => position >= 0 && position <= 100;

  private handlePointerUp = (e: PointerEvent) => {
    if (e.button !== 0) {
      e.preventDefault();
    }

    this.elem.removeEventListener('pointermove', this.handlePointerMove);
    this.elem.removeEventListener('pointerup', this.handlePointerUp);
  }

  private handlePreventContextMenu = (e: JQuery.ContextMenuEvent) => false;
}

export default HandleView;