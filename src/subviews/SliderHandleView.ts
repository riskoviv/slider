import EventEmitter from '../EventEmitter';

class SliderHandleView extends EventEmitter implements ISliderHandleView {
  $elem = $('<div class="slider__handle"></div>');

  allowedValues: number[];

  otherHandlePosition: number;

  private newLeft: number;

  private stepSizeInPercents: number;

  private halfStep: number;

  private currentValue: number;

  private handleDirectContainer: HTMLElement;

  constructor(private bounds: HandleBounds, private handleNumber: 1 | 2) {
    super();

    this.$elem.on('mousedown', this.handleMouseDown)
      .on('contextmenu', this.handlePreventContextMenu);

    this.createAllowedValuesArr();
  }

  setPositionAndCurrentValue(allowedLeft: number) {
    this.changeCurrentValue(allowedLeft);
    this.$elem.css('left', `${this.currentValue}%`);
    this.emit('handleValueChange', {
      handleNumber: this.handleNumber,
      left: this.currentValue,
      index: this.allowedValues.indexOf(this.currentValue),
    });
  }

  private createAllowedValuesArr() {
    const totalSliderRange = this.bounds.maxValue - this.bounds.minValue;
    this.stepSizeInPercents = (this.bounds.stepSize / totalSliderRange) * 100;
    this.halfStep = this.stepSizeInPercents / 2;
    this.allowedValues = [];

    for (let i = 0; i <= 100; i += this.stepSizeInPercents) {
      this.allowedValues.push(Number(i.toFixed(3)));
    }
    if (this.allowedValues[this.allowedValues.length - 1] !== 100) {
      this.allowedValues.push(100);
    }
  }

  private isCursorMovedEnough(left: number): boolean {
    const isCursorMovedHalfStep = (left > (this.currentValue + this.halfStep))
      || (left < (this.currentValue - this.halfStep));
    const isCursorOnAllowedValue = this.allowedValues.includes(left);

    if (isCursorMovedHalfStep || isCursorOnAllowedValue) {
      return true;
    }
    return false;
  }

  private changeCurrentValue(allowedLeft: number) {
    this.currentValue = this.findClosestAllowedValue(allowedLeft);
  }

  private findClosestAllowedValue(left: number) {
    return this.allowedValues.reduce((lastMinValue, currentValue) => {
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

    this.emit('getOtherHandlePosition', this.handleNumber);
  }

  private pixelsToPercentsOfBaseWidth(pixels: number) {
    return Number(((pixels / this.handleDirectContainer.offsetWidth) * 100).toFixed(1));
  }

  private handleMouseMove = (e: JQuery.MouseMoveEvent) => {
    this.newLeft = this.pixelsToPercentsOfBaseWidth(
      e.pageX - this.handleDirectContainer.offsetLeft,
    );

    const isValueChangeNeeded = this.isCursorMovedEnough(this.newLeft);

    let isHandleKeepsBounds;

    if (this.handleNumber === 1) {
      isHandleKeepsBounds = this.newLeft <= this.otherHandlePosition - this.stepSizeInPercents;
    } else if (this.handleNumber === 2) {
      isHandleKeepsBounds = this.newLeft >= this.otherHandlePosition + this.stepSizeInPercents;
    }

    if (isValueChangeNeeded && isHandleKeepsBounds) {
      this.setPositionAndCurrentValue(this.newLeft);
    }
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
