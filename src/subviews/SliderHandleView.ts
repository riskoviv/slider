import EventEmitter from '../EventEmitter';

class SliderHandleView extends EventEmitter implements ISliderHandleView {
  $elem = $('<div class="slider__handle"></div>');

  elem = this.$elem.get()[0];

  otherHandlePosition: number = 0;

  private newPosition: number = 0;

  private currentPosition: number = 0;

  private handleDirectContainer: HTMLElement = this.$elem.parent().get()[0];

  private isHandleKeepsBounds: boolean = false;

  constructor(
    private params: HandleParams,
    private handleNumber: 1 | 2,
    private isVertical: boolean,
  ) {
    super();
    this.bindEventListeners();
    this.$elem.css(
      '--handle-thickness',
      `${this.params.allowedPositions[1]}%`,
    );
  }

  setPositionAndCurrentValue(allowedPosition: number, findClosest: boolean) {
    this.currentPosition = findClosest
      ? this.findClosestAllowedPosition(allowedPosition)
      : allowedPosition;
    this.$elem.css('--handle-position', `${this.currentPosition}%`);
    this.emit('handleValueChange', {
      handleNumber: this.handleNumber,
      position: this.currentPosition,
      index: this.params.allowedPositions.indexOf(this.currentPosition),
    });
  }

  private bindEventListeners() {
    this.elem.addEventListener('pointerdown', this.handleMouseDown);
    this.$elem.on('contextmenu', this.handlePreventContextMenu);
  }

  private isCursorMovedEnough(position: number): boolean {
    const isCursorMovedHalfStep = (position > (this.currentValue + this.params.halfStep))
    || (position < (this.currentValue - this.params.halfStep));
    const isCursorOnAllowedValue = this.params.allowedPositions.includes(position)
      && position !== this.currentValue;

    if (isCursorMovedHalfStep || isCursorOnAllowedValue) {
      return true;
    }
    return false;
  }

  private findClosestAllowedValue(position: number) {
    return this.params.allowedPositions.reduce((lastMinValue, currentValue) => {
      if (Math.abs(position - currentValue) < Math.abs(position - lastMinValue)) {
        return currentValue;
      }
      return lastMinValue;
    });
  }

  private handleMouseDown = (e: PointerEvent) => {
    if (e.button !== 0) {
      return;
    }

    e.preventDefault();

    this.elem.setPointerCapture(e.pointerId);

    if (this.handleDirectContainer === undefined) {
      [this.handleDirectContainer] = this.$elem.parent().get();
    }

    this.elem.addEventListener('pointermove', this.handleMouseMove);
    this.elem.addEventListener('pointerup', this.handleMouseUp);

    if (this.params.isInterval) {
      this.emit('getOtherHandlePosition', this.handleNumber);
    }
  }

  private pixelsToPercentsOfBaseLength(pixels: number): number {
    const dimension = this.isVertical ? 'offsetHeight' : 'offsetWidth';
    return Number(((pixels / this.handleDirectContainer[dimension]) * 100)
      .toFixed(this.params.stepPrecision));
  }

  private roundToStepPrecision = (position: number) => (
    Number(position.toFixed(this.params.stepPrecision))
  );
  }

  private handleMouseMove = (e: PointerEvent) => {
    this.newPosition = this.pixelsToPercentsOfBaseLength(
      this.isVertical
        ? e.pageY - this.handleDirectContainer.offsetTop
        : e.pageX - this.handleDirectContainer.offsetLeft,
    );

    const isValueChangeNeeded = this.isCursorMovedEnough(this.newPosition);

    if (this.params.isInterval) {
      this.isHandleKeepsBounds = this.checkHandleBounds();
    } else {
      this.isHandleKeepsBounds = true;
    }

    if (isValueChangeNeeded && this.isHandleKeepsBounds) {
      this.setPositionAndCurrentValue(this.newPosition);
    }
  }

  private checkHandleBounds = (): boolean => {
    if (this.handleNumber === 1) {
      return this.newPosition <= this.otherHandlePosition - this.params.stepSizeInPercents;
    }

    return this.newPosition >= this.otherHandlePosition + this.params.stepSizeInPercents;
  }

  private handleMouseUp = (e: PointerEvent) => {
    if (e.button !== 0) {
      e.preventDefault();
    }

    this.elem.removeEventListener('pointermove', this.handleMouseMove);
    this.elem.removeEventListener('pointerup', this.handleMouseUp);
  }

  private handlePreventContextMenu = (e: JQuery.ContextMenuEvent) => false;
}

export default SliderHandleView;
