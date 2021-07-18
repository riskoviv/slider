import EventEmitter from '../EventEmitter';

class SliderHandleView extends EventEmitter implements ISliderHandleView {
  $elem = $('<div class="slider__handle"></div>');

  otherHandlePosition: number;

  private newLeft: number;

  private currentValue: number;

  private handleDirectContainer: HTMLElement;

  private isHandleKeepsBounds: boolean;

  constructor(private params: HandleParams, private handleNumber: 1 | 2) {
    super();
    this.$elem.on('mousedown', this.handleMouseDown)
      .on('contextmenu', this.handlePreventContextMenu);
  }

  setPositionAndCurrentValue(allowedLeft: number) {
    this.changeCurrentValue(allowedLeft);
    this.$elem.css('left', `${this.currentValue}%`);
    this.emit('handleValueChange', {
      handleNumber: this.handleNumber,
      left: this.currentValue,
      index: this.params.allowedValues.indexOf(this.currentValue),
    });
  }

  private isCursorMovedEnough(left: number): boolean {
    const isCursorMovedHalfStep = (left > (this.currentValue + this.params.halfStep))
      || (left < (this.currentValue - this.params.halfStep));
    const isCursorOnAllowedValue = this.params.allowedValues.includes(left);

    if (isCursorMovedHalfStep || isCursorOnAllowedValue) {
      return true;
    }
    return false;
  }

  private changeCurrentValue(allowedLeft: number) {
    this.currentValue = this.findClosestAllowedValue(allowedLeft);
  }

  private findClosestAllowedValue(left: number) {
    return this.params.allowedValues.reduce((lastMinValue, currentValue) => {
      if (Math.abs(left - currentValue) < Math.abs(left - lastMinValue)) {
        return currentValue;
      }
      return lastMinValue;
    });
  }

  private handleMouseDown = (e: JQuery.MouseDownEvent) => {
    if (e.originalEvent.button !== 0) {
      return;
    }

    e.preventDefault();

    if (this.handleDirectContainer === undefined) {
      [this.handleDirectContainer] = this.$elem.parent().get();
    }

    $(document).on('mousemove', this.handleMouseMove)
      .on('mouseup', this.handleMouseUp);

    if (this.params.isInterval) {
      this.emit('getOtherHandlePosition', this.handleNumber);
    }
  }

  private pixelsToPercentsOfBaseWidth(pixels: number) {
    return Number(((pixels / this.handleDirectContainer.offsetWidth) * 100).toFixed(1));
  }

  private handleMouseMove = (e: JQuery.MouseMoveEvent) => {
    this.newLeft = this.pixelsToPercentsOfBaseWidth(
      e.pageX - this.handleDirectContainer.offsetLeft,
    );

    const isValueChangeNeeded = this.isCursorMovedEnough(this.newLeft);

    if (this.params.isInterval) {
      this.isHandleKeepsBounds = this.checkHandleBounds();
    } else {
      this.isHandleKeepsBounds = true;
    }

    if (isValueChangeNeeded && this.isHandleKeepsBounds) {
      this.setPositionAndCurrentValue(this.newLeft);
    }
  }

  private checkHandleBounds = (): boolean => {
    if (this.handleNumber === 1) {
      return this.newLeft <= this.otherHandlePosition - this.params.stepSizeInPercents;
    }

    return this.newLeft >= this.otherHandlePosition + this.params.stepSizeInPercents;
  }

  private handleMouseUp = (e: JQuery.MouseUpEvent) => {
    if (e.originalEvent.button !== 0) {
      e.preventDefault();
    }

    $(document).off('mousemove', this.handleMouseMove)
      .off('mouseup', this.handleMouseUp);
  }

  private handlePreventContextMenu = (e: JQuery.ContextMenuEvent) => false;
}

export default SliderHandleView;
